/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Matter from 'matter-js';
import { MascotExpression } from '../types/game';
import { GAME_CONFIG, getItemConfigByLevel } from './config';
import { SavedItemData } from './storage';

// ========================================================
// ĐỘNG CƠ VẬT LÝ MATTER.JS CHO TRẠM Y TẾ MERGE
// Thiết kế va chạm mượt mà, không rung lắc vô hạn,
// không nảy quá mạnh và loại bỏ triệt để hiện tượng xuyên tường.
// ========================================================

export interface CustomBodyData {
  id: string;
  level: number;
  isMerging: boolean;
  scale: number;
  targetScale: number;
  scaleVelocity: number;
  expression: MascotExpression;
  squishTimer: number;
  createdAt: number;
}

export type MedicalBody = Matter.Body & {
  customData: CustomBodyData;
};

export class PhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  public width: number;
  public height: number;
  public dangerLineY: number;
  public scaleFactor: number = 1.0;

  // Danh sách các vật phẩm y tế hiện có trong thùng
  public items: MedicalBody[] = [];

  // Vách tường thùng chứa (trái, phải, đáy, bo góc đáy)
  private walls: Matter.Body[] = [];

  // Callback sự kiện
  public onMergeCallback?: (
    x: number,
    y: number,
    newLevel: number,
    points: number
  ) => void;
  public onBounceCallback?: (velocity: number) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.dangerLineY = GAME_CONFIG.dangerLineY;

    // Cập nhật scaleFactor và vạch nguy hiểm thích ứng theo kích thước thiết bị
    this.updateDimensions(width, height);

    // Khởi tạo Matter.js Engine với thông số tối ưu cho casual mobile
    this.engine = Matter.Engine.create({
      gravity: {
        x: 0,
        y: GAME_CONFIG.gravity,
        scale: 0.001,
      },
      positionIterations: 8, // Tăng số bước kiểm tra vị trí để vật không xuyên nhau
      velocityIterations: 8, // Tăng độ ổn định vận tốc va chạm
    });

    this.world = this.engine.world;

    // Tạo các vách thùng chứa
    this.setupWalls();

    // Lắng nghe sự kiện va chạm để thực hiện HỢP NHẤT (Merge)
    this.setupCollisionHandlers();
  }

  /**
   * Tính toán lại tỷ lệ co giãn vật phẩm và vạch cảnh báo theo màn hình thiết bị
   */
  public updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;

    // 1. Tỷ lệ scale thích ứng:
    // Tiêu chuẩn cơ sở: 410px rộng x 580px cao
    // - iPhone / Màn hình nhỏ (width ~360-380px, height ~420-500px): scaleFactor ~0.82 - 0.86
    //   giúp vật phẩm gọn gàng, tăng không gian chứa, không bị đầy thùng quá nhanh
    // - iPad / Màn hình lớn (width ~460-500px, height ~600-750px): scaleFactor chuẩn 1.0 (tối đa 1.05)
    const baseW = 410;
    const baseH = 580;
    const sW = width / baseW;
    const sH = height / baseH;
    this.scaleFactor = Math.max(0.80, Math.min(1.05, Math.min(sW, sH)));

    // 2. Vạch cảnh báo quá tải (dangerLineY):
    // Đảm bảo khoảng rơi từ trên xuống vừa vặn, không bị quá ngắn trên iPhone và không bị quá sâu trên iPad
    this.dangerLineY = Math.max(68, Math.min(95, Math.round(height * 0.15)));
  }

  /**
   * Tạo 3 vách thùng chứa (trái, phải, đáy) và 2 miếng vát bo góc đáy
   * để vật phẩm không bao giờ bị kẹt ở góc nhọn, tự lăn vào giữa tự nhiên.
   */
  public setupWalls() {
    // Xóa tường cũ nếu có
    if (this.walls.length > 0) {
      Matter.World.remove(this.world, this.walls);
      this.walls = [];
    }

    const wallThickness = 100; // Tường siêu dày chống xuyên thủng tuyệt đối
    const w = this.width;
    const h = this.height;

    // 1. Tường đáy
    const floor = Matter.Bodies.rectangle(
      w / 2,
      h + wallThickness / 2 - 4,
      w * 2,
      wallThickness,
      {
        isStatic: true,
        friction: 0.8,
        restitution: 0.1, // Độ nảy thấp để vật ổn định
        label: 'wall_floor',
      }
    );

    // 2. Tường trái (kéo dài lên rất cao trên đỉnh để vật nảy mạnh không bao giờ bay ra ngoài)
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2 + 10,
      -h * 0.5,
      wallThickness,
      h * 4,
      {
        isStatic: true,
        friction: 0.5,
        restitution: 0.1,
        label: 'wall_left',
      }
    );

    // 3. Tường phải (kéo dài lên rất cao trên đỉnh)
    const rightWall = Matter.Bodies.rectangle(
      w + wallThickness / 2 - 10,
      -h * 0.5,
      wallThickness,
      h * 4,
      {
        isStatic: true,
        friction: 0.5,
        restitution: 0.1,
        label: 'wall_right',
      }
    );

    // 4. Hai vát nghiêng bo góc đáy (giúp các vật tròn lăn mượt về giữa)
    const cornerSize = 40;
    const leftChamfer = Matter.Bodies.rectangle(
      15,
      h - 8,
      cornerSize * 1.5,
      14,
      {
        isStatic: true,
        angle: Math.PI / 4,
        friction: 0.4,
        restitution: 0.1,
        label: 'wall_chamfer_left',
      }
    );

    const rightChamfer = Matter.Bodies.rectangle(
      w - 15,
      h - 8,
      cornerSize * 1.5,
      14,
      {
        isStatic: true,
        angle: -Math.PI / 4,
        friction: 0.4,
        restitution: 0.1,
        label: 'wall_chamfer_right',
      }
    );

    this.walls = [floor, leftWall, rightWall, leftChamfer, rightChamfer];
    Matter.World.add(this.world, this.walls);
  }

  /**
   * Đăng ký bộ xử lý va chạm của Matter.js
   */
  private setupCollisionHandlers() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const bodyA = pair.bodyA as MedicalBody;
        const bodyB = pair.bodyB as MedicalBody;

        // Phát âm thanh va chạm nhẹ (bounce)
        if (this.onBounceCallback) {
          const speedA = Matter.Body.getSpeed(bodyA);
          const speedB = Matter.Body.getSpeed(bodyB);
          const maxSpeed = Math.max(speedA, speedB);
          if (maxSpeed > 1.2) {
            this.onBounceCallback(maxSpeed);
          }
        }

        // Biểu cảm chịu ép khi va chạm mạnh
        if (bodyA.customData && !bodyA.customData.isMerging) {
          bodyA.customData.expression = 'squished';
          bodyA.customData.squishTimer = 18;
        }
        if (bodyB.customData && !bodyB.customData.isMerging) {
          bodyB.customData.expression = 'squished';
          bodyB.customData.squishTimer = 18;
        }

        // KIỂM TRA ĐIỀU KIỆN MERGE (HỢP NHẤT)
        // 1. Cả 2 body đều là vật phẩm y tế
        // 2. Cùng cấp bậc (level)
        // 3. Chưa bị đánh dấu đang merge (tránh double merge)
        if (
          bodyA.customData &&
          bodyB.customData &&
          bodyA.customData.level === bodyB.customData.level &&
          !bodyA.customData.isMerging &&
          !bodyB.customData.isMerging
        ) {
          const currentLevel = bodyA.customData.level;

          // Khóa merge ngay lập tức cho cả 2 body
          bodyA.customData.isMerging = true;
          bodyB.customData.isMerging = true;

          // Tọa độ điểm hợp nhất ở trung điểm giữa 2 vật
          const midX = (bodyA.position.x + bodyB.position.x) / 2;
          const midY = (bodyA.position.y + bodyB.position.y) / 2;

          const nextLevel = Math.min(12, currentLevel + 1);
          const nextConfig = getItemConfigByLevel(nextLevel);

          // Xóa 2 body cũ khỏi World ngay trong tick an toàn tiếp theo
          setTimeout(() => {
            this.removeBody(bodyA);
            this.removeBody(bodyB);

            // Tạo vật phẩm mới ở cấp tiếp theo tại vị trí trung điểm
            const newBody = this.spawnItem(midX, midY, nextLevel, false);
            if (newBody) {
              // Hiệu ứng phóng to nảy bật (scale: 0.6 -> 1.15 -> 1.0)
              newBody.customData.scale = 0.6;
              newBody.customData.targetScale = 1.0;
              newBody.customData.scaleVelocity = 0.08;
              newBody.customData.expression = 'merge_excited';
              newBody.customData.squishTimer = 25;

              // Cho vật mới nảy nhẹ lên trên một chút tạo cảm giác sống động
              Matter.Body.setVelocity(newBody, {
                x: (Math.random() - 0.5) * 1.5,
                y: -2.0,
              });
            }

            // Kích hoạt callback cộng điểm và tạo hiệu ứng particle
            if (this.onMergeCallback) {
              this.onMergeCallback(midX, midY, nextLevel, nextConfig.score);
            }
          }, 16);
        }
      }
    });
  }

  /**
   * Tạo một vật phẩm y tế mới trong thế giới vật lý
   */
  public spawnItem(
    x: number,
    y: number,
    level: number,
    isInitialDrop: boolean = true,
    isRestore: boolean = false
  ): MedicalBody {
    const config = getItemConfigByLevel(level);

    // Kích thước co giãn linh hoạt theo tỷ lệ scaleFactor của từng thiết bị
    const w = (config.width || config.radius * 2) * this.scaleFactor;
    const h = (config.height || config.radius * 2) * this.scaleFactor;
    const chamferR = (config.chamferRadius || 12) * this.scaleFactor;

    // Giới hạn tọa độ X để vật mới không spawn dính vào vách tường
    const halfSpan = Math.max(w, h) / 2;
    const clampedX = Math.max(
      halfSpan + 14,
      Math.min(this.width - halfSpan - 14, x)
    );

    // Tạo Body Collider chính xác theo hình dáng vật phẩm (Capsule, Rounded Rect, Chamfered Rect)
    // Chamfer bo góc giúp vật thể lăn và xếp đè tự nhiên, không bị kẹt góc
    const body = Matter.Bodies.rectangle(
      clampedX,
      y,
      w,
      h,
      {
        chamfer: { radius: chamferR },
        friction: 0.42,       // Ma sát vừa phải giúp lăn và nằm ổn định
        frictionAir: 0.014,   // Lực cản không khí nhẹ
        restitution: 0.16,    // Độ nảy mềm mại casual
        density: 0.002,
        label: `medical_${level}`,
      }
    ) as MedicalBody;

    // Gán dữ liệu tùy chỉnh cho body
    body.customData = {
      id: Math.random().toString(36).substring(2, 9),
      level,
      isMerging: false,
      scale: isRestore ? 1.0 : (isInitialDrop ? 1.0 : 0.6),
      targetScale: 1.0,
      scaleVelocity: isRestore ? 0 : 0.06,
      expression: isRestore ? 'happy' : (isInitialDrop ? 'falling' : 'merge_excited'),
      squishTimer: isRestore ? 0 : (isInitialDrop ? 20 : 30),
      createdAt: isRestore ? Date.now() - 3500 : Date.now(),
    };

    this.items.push(body);
    Matter.World.add(this.world, body);

    return body;
  }

  /**
   * Xóa một body khỏi thế giới vật lý và danh sách items
   */
  public removeBody(body: MedicalBody) {
    const index = this.items.indexOf(body);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    Matter.World.remove(this.world, body);
  }

  /**
   * Cập nhật kích thước khung chứa khi resize màn hình
   */
  public resize(width: number, height: number) {
    this.updateDimensions(width, height);
    this.setupWalls();
  }

  /**
   * Cập nhật một bước vật lý (Tick 60 FPS)
   */
  public update(delta: number = 1000 / 60) {
    Matter.Engine.update(this.engine, delta);

    // 1. Kiểm tra an toàn cho tất cả vật phẩm: Giới hạn tốc độ tối đa, chống xuyên tường, chống lỗi NaN
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const data = item.customData;
      if (!data) continue;

      // Bảo vệ chống lỗi NaN trong tính toán va chạm vật lý
      if (isNaN(item.position.x) || isNaN(item.position.y)) {
        Matter.Body.setPosition(item, {
          x: this.width / 2 + (Math.random() - 0.5) * 40,
          y: this.height * 0.5,
        });
        Matter.Body.setVelocity(item, { x: 0, y: 0 });
      }

      // Giới hạn tốc độ tối đa tránh hiện tượng nổ lực văng ra ngoài khi bị nén ép
      const speed = Matter.Body.getSpeed(item);
      if (speed > 12) {
        Matter.Body.setSpeed(item, 12);
      }

      // Giữ vật phẩm luôn nằm an toàn trong lòng thùng chứa
      const minX = 18;
      const maxX = this.width - 18;
      if (item.position.x < minX) {
        Matter.Body.setPosition(item, { x: minX, y: item.position.y });
        Matter.Body.setVelocity(item, { x: Math.max(0, item.velocity.x), y: item.velocity.y });
      } else if (item.position.x > maxX) {
        Matter.Body.setPosition(item, { x: maxX, y: item.position.y });
        Matter.Body.setVelocity(item, { x: Math.min(0, item.velocity.x), y: item.velocity.y });
      }

      // Đáy thùng chứa
      if (item.position.y > this.height - 18) {
        Matter.Body.setPosition(item, { x: item.position.x, y: this.height - 18 });
        Matter.Body.setVelocity(item, { x: item.velocity.x * 0.8, y: Math.min(0, item.velocity.y) });
      }

      // Cập nhật biểu cảm khuôn mặt
      if (data.squishTimer > 0) {
        data.squishTimer--;
      } else {
        // Tốc độ rơi nhanh -> biểu cảm 'falling'
        if (item.velocity.y > 3.0) {
          data.expression = 'falling';
        } else {
          data.expression = 'happy';
        }
      }

      // Cập nhật scale hiệu ứng nảy (pop-in khi merge)
      if (data.scale < data.targetScale) {
        data.scale += data.scaleVelocity;
        if (data.scale >= 1.15) {
          data.scaleVelocity = -0.03; // Nảy qua 1.15 rồi co lại về 1.0
        }
      } else if (data.scaleVelocity < 0 && data.scale > 1.0) {
        data.scale += data.scaleVelocity;
        if (data.scale <= 1.0) {
          data.scale = 1.0;
          data.scaleVelocity = 0;
        }
      }
    }
  }

  /**
   * Kiểm tra xem có vật phẩm nào đang nằm phía trên vạch cảnh báo quá tải không.
   * Chỉ tính những vật đã ổn định (vận tốc nhỏ < 0.8) và đã tồn tại > 1.8 giây sau khi thả.
   */
  public checkDangerStatus(): {
    isOverflowing: boolean;
    highestOverflowY: number;
  } {
    const now = Date.now();
    let isOverflowing = false;
    let highestOverflowY = this.dangerLineY;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (!item.customData) continue;
      const config = getItemConfigByLevel(item.customData.level);

      // Điểm kiểm tra là phần thân trên của vật phẩm (có tính scaleFactor)
      const checkY = item.position.y - (config.height || config.radius * 2) * 0.35 * this.scaleFactor;

      // Vật phải tồn tại ít nhất 1.8s (để không bắt nhầm vật đang rơi và nảy tự nhiên từ trên xuống)
      const age = now - item.customData.createdAt;
      const speed = Math.sqrt(item.velocity.x * item.velocity.x + item.velocity.y * item.velocity.y);

      // Chỉ cảnh báo khi vật ĐÃ ĐỨNG YÊN (tốc độ < 0.8) và thật sự ứ đọng phía trên vạch cảnh báo
      if (age > 1800 && checkY < this.dangerLineY && speed < 0.8) {
        isOverflowing = true;
        if (checkY < highestOverflowY) {
          highestOverflowY = checkY;
        }
      }
    }

    return { isOverflowing, highestOverflowY };
  }

  /**
   * Xóa toàn bộ vật phẩm để bắt đầu ván mới
   */
  public clearAllItems() {
    for (const item of this.items) {
      Matter.World.remove(this.world, item);
    }
    this.items = [];
  }

  /**
   * Xuất danh sách vật phẩm hiện tại theo tỷ lệ chuẩn hóa (0.0 -> 1.0)
   * Giúp khôi phục chính xác trên mọi kích thước màn hình
   */
  public exportItems(): SavedItemData[] {
    return this.items.map((item) => ({
      normX: item.position.x / this.width,
      normY: item.position.y / this.height,
      angle: item.angle,
      level: item.customData.level,
    }));
  }

  /**
   * Khôi phục các vật phẩm từ ván chơi dở dang đã lưu
   */
  public restoreItems(savedItems: SavedItemData[]) {
    this.clearAllItems();
    for (const item of savedItems) {
      const config = getItemConfigByLevel(item.level);
      const w = (config.width || config.radius * 2) * this.scaleFactor;
      const h = (config.height || config.radius * 2) * this.scaleFactor;
      const halfSpan = Math.max(w, h) / 2;

      // Đảm bảo tọa độ nằm trọn trong thùng chứa, tránh kẹt sát tường hoặc vọt vạch
      const realX = Math.max(halfSpan + 14, Math.min(this.width - halfSpan - 14, item.normX * this.width));
      const realY = Math.max(this.dangerLineY + 12, Math.min(this.height - 22, item.normY * this.height));

      const body = this.spawnItem(realX, realY, item.level, false, true);
      if (body) {
        Matter.Body.setAngle(body, item.angle || 0);
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
      }
    }
  }
}

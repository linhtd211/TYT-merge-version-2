/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MascotExpression } from '../types/game';
import { getItemConfigByLevel } from './config';
import { GameStorage } from './storage';
import { getSprite, getNurseSprite } from './sprites';

// ========================================================
// BỘ VẼ MASCOT VẬT TƯ Y TẾ 2D KAWAII CHUẨN THIẾT KẾ
// Thiết kế hình ảnh rõ ràng theo từng loại thiết bị/vật tư y tế:
// - Viên thuốc: Con nhộng bo tròn 2 nửa xanh & trắng, viền cùng màu tự nhiên
// - Băng cá nhân: Miếng dán cam đào có miếng gạc trắng và lỗ thoáng khí
// - Băng cuộn Kinesiology: Cuộn băng dán cơ màu hồng tươi 3D có dải đuôi vểnh lên, 2 mắt con nhộng đứng trên má kem xinh xắn
// - Chai sát khuẩn: Chai xanh ngọc lam trong, cổ chai và vòi pump xịt
// - Nhiệt kế điện tử: Thiết kế súng nhiệt kế trán/que đo y tế với màn hình LCD 36.5°C, đầu dò bạc
// - Ống nghe y tế: Dây nghe teal cuộn gọn, gọng tai kim loại và chuông nghe bạc 2 mặt
// - Máy kẹp SpO2: Máy kẹp ngón tay màu cyan với màn hình OLED hiển thị tim đỏ và chỉ số 98%
// - Máy đo huyết áp: Máy để bàn hiện số 120/80, nút Start to, kèm vòng bít quấn tay và dây khí
// - Túi cấp cứu: Vali túi đỏ rực rỡ, quai xách và chữ thập trắng nổi bật
// - Máy sốc tim AED: Hộp máy vàng cam với biểu tượng tim & tia sét, nút giật shock
// - Hộp cứu sinh tối thượng: Vali ngọc lục bảo mạ vàng hoàng gia có vương miện
//
// ĐẶC BIỆT: TOÀN BỘ ĐƯỜNG VIỀN ĐỀU DÙNG TÔNG MÀU ĐỒNG NHẤT VỚI BẢN THÂN VẬT PHẨM,
// TUYỆT ĐỐI KHÔNG CÓ ĐƯỜNG VIỀN ĐEN ĐẬM BÊN NGOÀI, GIÚP HÌNH ẢNH MỀM MẠI, TỰ NHIÊN.
// ========================================================

/**
 * Vẽ mắt, miệng và má hồng cho nhân vật chibi theo biểu cảm
 * Sử dụng tông màu than chì ấm mềm mại (#334155), không dùng đen đậm gắt.
 */
function drawCuteFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  expression: MascotExpression = 'happy',
  time: number = 0,
  darkPanel: boolean = false
) {
  // Mỗi cung là một nhánh riêng, tránh Canvas nối hai điểm sáng thành vệt trắng.
  const faceArc = (x: number, y: number, radius: number, from: number, to: number, counterClockwise = false) => {
    ctx.moveTo(x + Math.cos(from) * radius, y + Math.sin(from) * radius);
    ctx.arc(x, y, radius, from, to, counterClockwise);
  };
  const eyeDistance = size * 0.36;
  const eyeRadius = Math.max(2.2, size * 0.1);
  const eyeY = cy - size * 0.05;

  // 1. MÁ HỒNG CHIBI (BLUSH) - Hồng đào tươi tắn
  ctx.save();
  ctx.fillStyle = 'rgba(251, 113, 133, 0.65)';
  ctx.beginPath();
  ctx.ellipse(cx - eyeDistance - size * 0.12, eyeY + size * 0.16, size * 0.16, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + eyeDistance + size * 0.12, eyeY + size * 0.16, size * 0.16, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. MẮT (EYES) - Tông than chì mềm #334155
  ctx.save();
  ctx.fillStyle = '#36251D';
  ctx.strokeStyle = darkPanel ? '#F5D9B3' : '#51362A';
  ctx.lineWidth = Math.max(2.0, size * 0.075);
  ctx.lineCap = 'round';

  const isBlinking = Math.sin(time * 0.0035 + cx) > 0.96 && expression === 'happy';

  if (expression === 'squished') {
    // Mắt nhắm chữ > < (😣) khi va chạm mạnh
    ctx.beginPath();
    ctx.moveTo(cx - eyeDistance - eyeRadius * 1.1, eyeY - eyeRadius * 0.8);
    ctx.lineTo(cx - eyeDistance + eyeRadius * 0.5, eyeY);
    ctx.lineTo(cx - eyeDistance - eyeRadius * 1.1, eyeY + eyeRadius * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + eyeDistance + eyeRadius * 1.1, eyeY - eyeRadius * 0.8);
    ctx.lineTo(cx + eyeDistance - eyeRadius * 0.5, eyeY);
    ctx.lineTo(cx + eyeDistance + eyeRadius * 1.1, eyeY + eyeRadius * 0.8);
    ctx.stroke();
  } else if (expression === 'merge_excited' || isBlinking) {
    // Mắt cười híp mí cong tròn ^ ^ (😆) khi hợp nhất thành công
    ctx.beginPath();
    faceArc(cx - eyeDistance, eyeY + eyeRadius * 0.3, eyeRadius * 1.2, Math.PI, 0, false);
    ctx.stroke();

    ctx.beginPath();
    faceArc(cx + eyeDistance, eyeY + eyeRadius * 0.3, eyeRadius * 1.2, Math.PI, 0, false);
    ctx.stroke();
  } else if (expression === 'falling') {
    // Mắt tròn to ngạc nhiên (😮) khi đang rơi từ tay cô y tá
    ctx.beginPath();
    faceArc(cx - eyeDistance, eyeY, eyeRadius * 1.3, 0, Math.PI * 2);
    faceArc(cx + eyeDistance, eyeY, eyeRadius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Điểm sáng long lanh trong mắt
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    faceArc(cx - eyeDistance + eyeRadius * 0.4, eyeY - eyeRadius * 0.4, eyeRadius * 0.55, 0, Math.PI * 2);
    faceArc(cx + eyeDistance + eyeRadius * 0.4, eyeY - eyeRadius * 0.4, eyeRadius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Mắt bình thường anime long lanh 2 đốm sáng (🙂)
    ctx.beginPath();
    faceArc(cx - eyeDistance, eyeY, eyeRadius * 1.1, 0, Math.PI * 2);
    faceArc(cx + eyeDistance, eyeY, eyeRadius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Hai đốm sáng lấp lánh trong mắt
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    faceArc(cx - eyeDistance + eyeRadius * 0.35, eyeY - eyeRadius * 0.35, eyeRadius * 0.5, 0, Math.PI * 2);
    faceArc(cx + eyeDistance + eyeRadius * 0.35, eyeY - eyeRadius * 0.35, eyeRadius * 0.5, 0, Math.PI * 2);
    faceArc(cx - eyeDistance - eyeRadius * 0.3, eyeY + eyeRadius * 0.3, eyeRadius * 0.25, 0, Math.PI * 2);
    faceArc(cx + eyeDistance - eyeRadius * 0.3, eyeY + eyeRadius * 0.3, eyeRadius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  if (darkPanel && !isBlinking && expression !== 'squished' && expression !== 'merge_excited') {
    ctx.strokeStyle = '#D8B587';
    ctx.lineWidth = Math.max(0.6, size * 0.025);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      faceArc(cx + side * eyeDistance, eyeY, eyeRadius * (expression === 'falling' ? 1.3 : 1.1), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. MIỆNG (MOUTH) - Tươi cười duyên dáng
  ctx.save();
  ctx.strokeStyle = darkPanel ? '#F5D9B3' : '#51362A';
  ctx.fillStyle = '#F43F5E';
  ctx.lineWidth = Math.max(1.8, size * 0.07);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const mouthY = eyeY + size * 0.22;

  if (expression === 'falling') {
    // Miệng tròn chữ O ngạc nhiên
    ctx.beginPath();
    faceArc(cx, mouthY + size * 0.02, size * 0.11, 0, Math.PI * 2);
    ctx.stroke();
  } else if (expression === 'squished') {
    // Miệng lượn sóng biểu cảm nhăn mặt dễ thương
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.14, mouthY);
    ctx.quadraticCurveTo(cx - size * 0.05, mouthY + size * 0.07, cx, mouthY);
    ctx.quadraticCurveTo(cx + size * 0.05, mouthY - size * 0.07, cx + size * 0.14, mouthY);
    ctx.stroke();
  } else if (expression === 'merge_excited') {
    // Miệng cười hở răng lưỡi vui sướng
    ctx.beginPath();
    faceArc(cx, mouthY - size * 0.02, size * 0.16, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Miệng cười mỉm nhẹ nhàng
    ctx.beginPath();
    faceArc(cx, mouthY - size * 0.06, size * 0.15, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * HÀM VẼ CHÍNH: 11 VẬT PHẨM Y TẾ THỰC TẾ
 * Tất cả các đường viền đều được chuyển sang màu cùng tông với bản thân vật phẩm,
 * hoàn toàn không có đường viền đen đậm bên ngoài.
 */
export function drawMedicalMascot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  angle: number = 0,
  scale: number = 1.0,
  expression: MascotExpression = 'happy',
  time: number = 0,
  customRadius?: number,
  overrideSkin?: string
) {
  const skin = overrideSkin || GameStorage.getActiveSkin();
  const config = getItemConfigByLevel(level);
  const rawW = config.width || config.radius * 2;
  const rawH = config.height || config.radius * 2;
  const fitScale = customRadius ? (customRadius * 2) / Math.max(rawW, rawH) : 1.0;
  const w = rawW * scale * fitScale;
  const h = rawH * scale * fitScale;

  // Độ dày đường viền tinh tế, mềm mại
  const strokeW = Math.max(1.8, Math.min(w, h) * 0.042);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Dùng ảnh đã giải mã và thu nhỏ sẵn; biểu cảm vẫn vẽ động bằng Canvas.
  const transform = ctx.getTransform();
  const sprite = getSprite(skin, level, Math.max(w, h) * Math.hypot(transform.a, transform.b));
  if (sprite) {
    // Căn theo thân chuẩn, giữ tỷ lệ ảnh; phụ kiện mặc ngoài không bóp méo thân.
    const body = sprite.frame.body;
    const fit = customRadius
      ? (customRadius * 2 * scale) / Math.max(sprite.frame.width, sprite.frame.height)
      : Math.min(w / (sprite.frame.width * body.width), h / (sprite.frame.height * body.height));
    const imageW = sprite.frame.width * fit, imageH = sprite.frame.height * fit;
    const left = -(customRadius ? 0.5 : body.x) * imageW, top = -(customRadius ? 0.5 : body.y) * imageH;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sprite.source, left, top, imageW, imageH);
    const face = sprite.frame.face;
    drawCuteFace(ctx, left + face.x * imageW, top + face.y * imageH, imageW * face.size, expression, time, face.dark);
    ctx.restore();
    return;
  }

  // Áp dụng hiệu ứng hào quang theo trang phục độc quyền
  if (skin === 'sakura') {
    ctx.shadowColor = 'rgba(244, 114, 182, 0.45)';
    ctx.shadowBlur = 10;
  } else if (skin === 'cyber') {
    ctx.shadowColor = 'rgba(6, 182, 212, 0.55)';
    ctx.shadowBlur = 12;
  } else if (skin === 'royal') {
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 14;
  }

  switch (level) {
    // ====================================================
    // LEVEL 1: VIÊN THUỐC (Capsule Pill)
    // Con nhộng 2 nửa: nửa trên xanh dương, nửa dưới trắng, viền cùng màu tự nhiên
    // ====================================================
    case 1: {
      const capW = w;
      const capH = h;
      const capR = capW / 2;

      ctx.save();
      // Nửa dưới màu trắng kem y tế
      ctx.beginPath();
      ctx.roundRect(-capW / 2, -capH / 2, capW, capH, capR);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Nửa trên màu xanh dương tươi sáng
      ctx.save();
      ctx.beginPath();
      ctx.rect(-capW / 2 - 2, -capH / 2 - 2, capW + 4, capH / 2 + 2);
      ctx.clip();
      ctx.beginPath();
      ctx.roundRect(-capW / 2, -capH / 2, capW, capH, capR);
      ctx.fillStyle = config.color; // #38BDF8
      ctx.fill();
      ctx.restore();

      // Vạch khớp nối giữa hai nửa viên thuốc
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-capW / 2 + 2, 0);
      ctx.lineTo(capW / 2 - 2, 0);
      ctx.stroke();

      // Viền cùng màu tự nhiên: xanh dương ở nửa trên, xám xanh sáng ở nửa dưới
      // Nửa dưới viền xám xanh sáng tự nhiên
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(-capW / 2, -capH / 2, capW, capH, capR);
      ctx.stroke();

      // Nửa trên viền xanh dương đồng nhất
      ctx.save();
      ctx.beginPath();
      ctx.rect(-capW / 2 - 4, -capH / 2 - 4, capW + 8, capH / 2 + 4);
      ctx.clip();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(-capW / 2, -capH / 2, capW, capH, capR);
      ctx.stroke();
      ctx.restore();

      // Vệt sáng bóng capsule bên mép trái
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.roundRect(-capW * 0.36, -capH * 0.42, capW * 0.22, capH * 0.45, capW * 0.1);
      ctx.fill();

      // Khuôn mặt chibi ở nửa trên
      drawCuteFace(ctx, 0, -capH * 0.1, capW * 0.6, expression, time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 2: BĂNG CÁ NHÂN (Bandage Strip)
    // Miếng dán bo góc cam đào, viền cam ấm đồng nhất
    // ====================================================
    case 2: {
      const bW = w;
      const bH = h;
      const bR = config.chamferRadius * scale * fitScale;

      ctx.save();
      // Thân băng dán màu da cam đào ấm áp
      ctx.beginPath();
      ctx.roundRect(-bW / 2, -bH / 2, bW, bH, bR);
      ctx.fillStyle = config.color; // #FDBA74
      ctx.fill();

      // Miếng gạc trắng tiệt trùng ở trung tâm
      const padW = bW * 0.42;
      const padH = bH * 0.82;
      ctx.fillStyle = '#FFEDD5';
      ctx.beginPath();
      ctx.roundRect(-padW / 2, -padH / 2, padW, padH, 6);
      ctx.fill();
      ctx.strokeStyle = '#FDBA74';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Các lỗ thoáng khí chấm bi nhỏ hai cánh
      ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
      [-bW * 0.34, -bW * 0.26, bW * 0.26, bW * 0.34].forEach((dx) => {
        ctx.beginPath();
        ctx.arc(dx, -bH * 0.2, 1.6, 0, Math.PI * 2);
        ctx.arc(dx, bH * 0.2, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Viền cùng màu cam đào đậm với bản thân băng dán (KHÔNG DÙNG VIỀN ĐEN)
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(-bW / 2, -bH / 2, bW, bH, bR);
      ctx.stroke();

      // Vệt sáng bóng highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-bW * 0.42, -bH * 0.38, bW * 0.3, bH * 0.22, 4);
      ctx.fill();

      // Mặt chibi ở giữa miếng gạc
      drawCuteFace(ctx, 0, 0, bH * 0.65, expression, time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 3: CUỘN BĂNG DÁN CƠ KINESIOLOGY (Kinesiology Tape Roll)
    // Tái hiện chính xác 100% theo hình ảnh mẫu kinesiology.png:
    // - Cuộn băng dán cơ màu hồng tươi tắn với góc nhìn 3D lập thể
    // - Mặt trên elip màu hồng phấn nhạt với lõi tròn đậm màu
    // - Dải băng tháo dở uốn cong lượn về phía sau rồi vểnh lên góc phải
    // - Nửa thân trái có dải bóng đổ cong 3D tạo chiều sâu khối trụ
    // - Khuôn mặt chibi kawaii đặc trưng: 2 mắt con nhộng đứng trên má kem, mũi hạt đậu than chì
    // ====================================================
    case 3: {
      const gW = w;
      const gH = h;

      // Màu sắc theo trang phục (hỗ trợ Skin Classic, Sakura, Cyber, Royal)
      let rollMain = '#FF7597';     // Hồng tươi Kinesiology
      let rollShadow = '#F0507B';   // Hồng đậm bóng đổ
      let topFace = '#FFA6BF';      // Hồng phấn mặt trên
      let innerHole = '#FA7095';    // Lõi cuộn
      let tailOuter = '#FA7095';    // Dải băng phía sau
      let tailInner = '#FF8DAA';    // Mặt trong dải băng
      let cheekColor = '#FFFEE8';   // Má kem sáng
      let featureColor = '#222D3D'; // Mắt, mũi than chì

      if (skin === 'sakura') {
        rollMain = '#F472B6';
        rollShadow = '#DB2777';
        topFace = '#FBCFE8';
        innerHole = '#EC4899';
        tailOuter = '#EC4899';
        tailInner = '#F472B6';
      } else if (skin === 'cyber') {
        rollMain = '#FB7185';
        rollShadow = '#E11D48';
        topFace = '#38BDF8';
        innerHole = '#0284C7';
        tailOuter = '#F43F5E';
        tailInner = '#FDA4AF';
      } else if (skin === 'royal') {
        rollMain = '#E11D48';
        rollShadow = '#9F1239';
        topFace = '#FDE047';
        innerHole = '#CA8A04';
        tailOuter = '#BE123C';
        tailInner = '#FB7185';
      }

      ctx.save();

      // 1. DẢI BĂNG MỞ UỐN CONG VỀ PHÍA SAU VÀ VỂNH LÊN GÓC PHẢI (UNROLLED TAPE TAIL)
      // Dải băng chạy từ sau cuộn sang phải và vểnh lên
      ctx.save();
      // Phần thân dải băng mở bên phải
      ctx.fillStyle = tailOuter;
      ctx.beginPath();
      ctx.moveTo(gW * 0.12, -gH * 0.22);
      ctx.lineTo(gW * 0.47, -gH * 0.22);
      ctx.lineTo(gW * 0.47, gH * 0.24);
      ctx.lineTo(gW * 0.12, gH * 0.24);
      ctx.closePath();
      ctx.fill();

      // Vạt băng vểnh lên ở góc trên bên phải có bo tròn đầu
      const flapLeft = gW * 0.31;
      const flapRight = gW * 0.47;
      const flapTop = -gH * 0.46;
      const flapRadius = (flapRight - flapLeft) / 2;

      ctx.beginPath();
      ctx.moveTo(flapLeft, -gH * 0.22);
      ctx.lineTo(flapLeft, flapTop + flapRadius);
      ctx.arc(flapLeft + flapRadius, flapTop + flapRadius, flapRadius, Math.PI, 0, false);
      ctx.lineTo(flapRight, -gH * 0.22);
      ctx.closePath();
      ctx.fill();

      // Mặt trong nếp gấp dải băng màu sáng hơn
      ctx.fillStyle = tailInner;
      ctx.beginPath();
      ctx.moveTo(flapLeft, -gH * 0.22);
      ctx.lineTo(flapLeft, flapTop + flapRadius);
      ctx.arc(flapLeft + flapRadius, flapTop + flapRadius, flapRadius * 0.65, Math.PI, 0, false);
      ctx.lineTo(flapRight - flapRadius * 0.7, -gH * 0.22);
      ctx.closePath();
      ctx.fill();

      // Đường cong nối mặt trong của dải băng tạo chiều sâu
      ctx.fillStyle = tailInner;
      ctx.beginPath();
      ctx.moveTo(gW * 0.12, -gH * 0.22);
      ctx.bezierCurveTo(gW * 0.22, -gH * 0.26, gW * 0.38, -gH * 0.24, flapLeft, -gH * 0.22);
      ctx.lineTo(flapLeft, gH * 0.24);
      ctx.lineTo(gW * 0.12, gH * 0.24);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. THÂN CUỘN TRỤ CHÍNH (CYLINDRICAL ROLL BODY)
      const rollLeft = -gW * 0.47;
      const rollRight = gW * 0.15;
      const rollTopY = -gH * 0.22;
      const rollBottomY = gH * 0.24;
      const ellipseCX = (rollLeft + rollRight) / 2; // ~ -gW * 0.16
      const ellipseRX = (rollRight - rollLeft) / 2; // ~ gW * 0.31
      const ellipseRY = gH * 0.20;

      // Thân trụ màu hồng chính
      ctx.beginPath();
      ctx.moveTo(rollLeft, rollTopY);
      ctx.lineTo(rollLeft, rollBottomY);
      // Đáy cong theo mặt đáy khối trụ
      ctx.bezierCurveTo(
        rollLeft,
        rollBottomY + ellipseRY,
        rollRight,
        rollBottomY + ellipseRY,
        rollRight,
        rollBottomY
      );
      ctx.lineTo(rollRight, rollTopY);
      ctx.closePath();
      ctx.fillStyle = rollMain;
      ctx.fill();

      // 3. DẢI BÓNG ĐỔ KHỐI 3D TRÊN THÂN TRÁI (LEFT CRESCENT SHADOW)
      ctx.save();
      // Clip vào trong thân trụ
      ctx.beginPath();
      ctx.moveTo(rollLeft, rollTopY);
      ctx.lineTo(rollLeft, rollBottomY);
      ctx.bezierCurveTo(
        rollLeft,
        rollBottomY + ellipseRY,
        rollRight,
        rollBottomY + ellipseRY,
        rollRight,
        rollBottomY
      );
      ctx.lineTo(rollRight, rollTopY);
      ctx.closePath();
      ctx.clip();

      // Dải bóng cong màu hồng sẫm bên trái
      ctx.fillStyle = rollShadow;
      ctx.beginPath();
      ctx.moveTo(rollLeft, rollTopY);
      ctx.lineTo(rollLeft, rollBottomY + ellipseRY);
      ctx.bezierCurveTo(
        rollLeft + ellipseRX * 0.3,
        rollBottomY + ellipseRY * 0.9,
        rollLeft + ellipseRX * 0.65,
        rollBottomY + ellipseRY * 0.6,
        rollLeft + ellipseRX * 0.7,
        rollBottomY
      );
      ctx.bezierCurveTo(
        rollLeft + ellipseRX * 0.65,
        0,
        rollLeft + ellipseRX * 0.45,
        rollTopY * 0.5,
        rollLeft + ellipseRX * 0.35,
        rollTopY
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 4. MẶT TRÊN ELIP CỦA CUỘN BĂNG (TOP ELLIPSE SURFACE)
      ctx.beginPath();
      ctx.ellipse(ellipseCX, rollTopY, ellipseRX, ellipseRY, 0, 0, Math.PI * 2);
      ctx.fillStyle = topFace;
      ctx.fill();

      // Lõi tròn đậm màu ở giữa mặt trên
      ctx.beginPath();
      ctx.ellipse(ellipseCX, rollTopY, ellipseRX * 0.44, ellipseRY * 0.44, 0, 0, Math.PI * 2);
      ctx.fillStyle = innerHole;
      ctx.fill();

      // 5. KHUÔN MẶT CHIBI DỄ THƯƠNG (KAWAII MASCOT FACE)
      const faceX = ellipseCX;
      const faceY = gH * 0.10;
      const eyeSpacing = gW * 0.155;
      const cheekR = gW * 0.065;
      const eyeW = gW * 0.042;
      const eyeH = gH * 0.082;
      const eyeR = eyeW / 2;
      const mouthW = gW * 0.098;
      const mouthH = gH * 0.082;
      const mouthR = mouthW * 0.42;

      // A. Hai má tròn màu kem sáng (#FFFEE8)
      ctx.fillStyle = cheekColor;
      // Má trái
      ctx.beginPath();
      ctx.arc(faceX - eyeSpacing, faceY + gH * 0.012, cheekR, 0, Math.PI * 2);
      ctx.fill();
      // Má phải
      ctx.beginPath();
      ctx.arc(faceX + eyeSpacing, faceY + gH * 0.012, cheekR, 0, Math.PI * 2);
      ctx.fill();

      // B. Mắt & Miệng theo biểu cảm
      const isBlink = expression !== 'merge_excited' && Math.sin(time * 0.003) > 0.94;

      if (expression === 'merge_excited') {
        // Mắt nhắm tít cong vòm vui sướng ^ ^
        ctx.strokeStyle = featureColor;
        ctx.lineWidth = Math.max(2.4, gW * 0.048);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(faceX - eyeSpacing, faceY - gH * 0.035, gW * 0.045, Math.PI * 1.1, Math.PI * 1.9, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(faceX + eyeSpacing, faceY - gH * 0.035, gW * 0.045, Math.PI * 1.1, Math.PI * 1.9, false);
        ctx.stroke();

        // Miệng cười mở to hớn hở
        ctx.save();
        ctx.fillStyle = featureColor;
        ctx.beginPath();
        ctx.arc(faceX, faceY - 1, gW * 0.065, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (isBlink) {
        // Mắt nhắm chớp tự nhiên
        ctx.strokeStyle = featureColor;
        ctx.lineWidth = Math.max(2.0, gW * 0.038);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(faceX - eyeSpacing - gW * 0.032, faceY - gH * 0.035);
        ctx.lineTo(faceX - eyeSpacing + gW * 0.032, faceY - gH * 0.035);
        ctx.moveTo(faceX + eyeSpacing - gW * 0.032, faceY - gH * 0.035);
        ctx.lineTo(faceX + eyeSpacing + gW * 0.032, faceY - gH * 0.035);
        ctx.stroke();

        // Mũi/miệng hạt đậu
        ctx.fillStyle = featureColor;
        ctx.beginPath();
        ctx.roundRect(faceX - mouthW / 2, faceY - mouthH / 2, mouthW, mouthH, mouthR);
        ctx.fill();
      } else {
        // Biểu cảm chuẩn của kinesiology.png: 2 mắt viên con nhộng đứng + mũi/miệng hạt đậu
        ctx.fillStyle = featureColor;

        // Mắt trái: viên con nhộng đứng trên má kem
        ctx.beginPath();
        ctx.roundRect(faceX - eyeSpacing - eyeW / 2, faceY - gH * 0.076, eyeW, eyeH, eyeR);
        ctx.fill();

        // Mắt phải: viên con nhộng đứng trên má kem
        ctx.beginPath();
        ctx.roundRect(faceX + eyeSpacing - eyeW / 2, faceY - gH * 0.076, eyeW, eyeH, eyeR);
        ctx.fill();

        // Mũi/miệng hạt đậu ở giữa hai mắt
        ctx.beginPath();
        ctx.roundRect(faceX - mouthW / 2, faceY - mouthH / 2, mouthW, mouthH, mouthR);
        ctx.fill();
      }

      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 4: CHAI SÁT KHUẨN (Sanitizer Bottle)
    // Thân chai xanh ngọc lam trong suốt, cổ chai và vòi pump xịt
    // Viền xanh ngọc lam tự nhiên, không có viền đen
    // ====================================================
    case 4: {
      const bW = w;
      const bH = h;
      const bR = config.chamferRadius * scale * fitScale;

      ctx.save();
      // 1. Vòi pump xịt màu trắng ở trên đỉnh
      const pumpY = -bH / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      // Cổ pump
      ctx.beginPath();
      ctx.roundRect(-bW * 0.14, pumpY - bH * 0.14, bW * 0.28, bH * 0.14, 3);
      ctx.fill();
      ctx.stroke();
      // Đầu mỏ vịt xịt
      ctx.beginPath();
      ctx.roundRect(-bW * 0.28, pumpY - bH * 0.23, bW * 0.52, bH * 0.09, 3);
      ctx.fill();
      ctx.stroke();

      // 2. Thân chai chữ nhật bo tròn màu xanh ngọc lam
      ctx.beginPath();
      ctx.roundRect(-bW / 2, -bH / 2, bW, bH, bR);
      ctx.fillStyle = config.color; // #38BDF8
      ctx.fill();

      // Nhãn trắng ở thân dưới có dấu thập đỏ
      const lblW = bW * 0.7;
      const lblH = bH * 0.38;
      const lblY = bH * 0.15;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-lblW / 2, lblY - lblH / 2, lblW, lblH, 6);
      ctx.fill();
      ctx.stroke();

      // Chữ thập đỏ y tế trên nhãn
      ctx.fillStyle = '#EF4444';
      const crossW = lblW * 0.18;
      const crossH = lblH * 0.65;
      ctx.fillRect(-crossW / 2, lblY - crossH / 2, crossW, crossH);
      ctx.fillRect(-crossH / 2, lblY - crossW / 2, crossH, crossW);

      // Viền cùng màu xanh ngọc lam (#0284C7) đồng nhất
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(-bW / 2, -bH / 2, bW, bH, bR);
      ctx.stroke();

      // Highlight bóng thủy tinh
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-bW * 0.4, -bH * 0.42, bW * 0.16, bH * 0.6, 5);
      ctx.fill();

      // Mặt chibi ở phần trên của thân chai
      drawCuteFace(ctx, 0, -bH * 0.18, bW * 0.6, expression, time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 5: NHIỆT KẾ ĐIỆN TỬ (Infrared Forehead Thermometer Gun)
    // Thiết kế nguyên khối liền mạch (Seamless unified silhouette):
    // - Duy nhất 1 đường viền màu xanh cyan pastel (#0284C7) bao quanh toàn bộ thân máy
    // - Hoàn toàn không có 2 viền màu khác nhau, không có đường cắt ngang chia cắt thân máy
    // - Màn hình LCD kỹ thuật số 36.5°C nằm ngay ngắn ở phần đầu
    // - Khuôn mặt chibi dễ thương trên tay cầm với má hồng đào và mắt long lanh
    // - Đầu đo hồng ngoại phát tia sóng cam đào về phía trước
    // ====================================================
    case 5: {
      const sW = w;
      const sH = h;

      ctx.save();
      // 1. Ba tia sóng cảm biến hồng ngoại phát ra phía trước màu cam đào (#FB923C)
      ctx.strokeStyle = '#FB923C';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      const waveX = sW * 0.38;
      const waveY = -sH * 0.22;
      ctx.beginPath();
      ctx.moveTo(waveX + 2, waveY - 12); ctx.lineTo(waveX + 11, waveY - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(waveX + 5, waveY); ctx.lineTo(waveX + 16, waveY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(waveX + 2, waveY + 12); ctx.lineTo(waveX + 11, waveY + 20);
      ctx.stroke();

      // 2. VẼ ĐƯỜNG BAO NGUYÊN KHỐI LIỀN MẠCH CHO NHIỆT KẾ (SEAMLESS UNIFIED BODY)
      const left = -sW * 0.38;
      const rightNozzle = sW * 0.36;
      const topHead = -sH * 0.44;
      const bottomHead = -sH * 0.04;
      const frontHandle = -sW * 0.02;
      const bottomHandle = sH * 0.44;
      const r = 12; // Bán kính bo góc mềm mại

      // Tạo đường viền khép kín duy nhất bao quanh toàn bộ thân máy:
      ctx.beginPath();
      ctx.moveTo(left + r, topHead);
      ctx.lineTo(rightNozzle - r, topHead);
      ctx.arcTo(rightNozzle, topHead, rightNozzle, topHead + r, r);
      ctx.lineTo(rightNozzle, bottomHead - r);
      ctx.arcTo(rightNozzle, bottomHead, rightNozzle - r, bottomHead, r);
      ctx.lineTo(frontHandle + r + 6, bottomHead);
      ctx.arcTo(frontHandle, bottomHead, frontHandle, bottomHead + r + 4, r);
      ctx.lineTo(frontHandle, bottomHandle - r);
      ctx.arcTo(frontHandle, bottomHandle, frontHandle - r, bottomHandle, r);
      ctx.lineTo(left + r, bottomHandle);
      ctx.arcTo(left, bottomHandle, left, bottomHandle - r, r);
      ctx.lineTo(left, topHead + r);
      ctx.arcTo(left, topHead, left + r, topHead, r);
      ctx.closePath();

      // Đổ nền trắng y tế sạch sẽ cho toàn bộ thân máy
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // 3. CHI TIẾT TRANG TRÍ BÊN TRONG (CLIPPED TRONG THÂN MÁY):
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(left + r, topHead);
      ctx.lineTo(rightNozzle - r, topHead);
      ctx.arcTo(rightNozzle, topHead, rightNozzle, topHead + r, r);
      ctx.lineTo(rightNozzle, bottomHead - r);
      ctx.arcTo(rightNozzle, bottomHead, rightNozzle - r, bottomHead, r);
      ctx.lineTo(frontHandle + r + 6, bottomHead);
      ctx.arcTo(frontHandle, bottomHead, frontHandle, bottomHead + r + 4, r);
      ctx.lineTo(frontHandle, bottomHandle - r);
      ctx.arcTo(frontHandle, bottomHandle, frontHandle - r, bottomHandle, r);
      ctx.lineTo(left + r, bottomHandle);
      ctx.arcTo(left, bottomHandle, left, bottomHandle - r, r);
      ctx.lineTo(left, topHead + r);
      ctx.arcTo(left, topHead, left + r, topHead, r);
      ctx.closePath();
      ctx.clip();

      // Đệm đầu vòi cảm biến màu xanh pastel (#7DD3FC)
      ctx.fillStyle = '#7DD3FC';
      ctx.fillRect(sW * 0.16, topHead - 2, sW * 0.22, (bottomHead - topHead) + 4);

      // Đệm đế tay cầm màu xanh pastel (#7DD3FC)
      ctx.fillStyle = '#7DD3FC';
      ctx.fillRect(left - 2, bottomHandle - sH * 0.14, (frontHandle - left) + 4, sH * 0.16);

      // Vạch bóng sáng highlight dọc theo lưng máy
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(left + 3, topHead + 4, 3, (bottomHandle - topHead) - 8);
      ctx.restore();

      // 4. CÒ BẤM NHIỆT ĐỘ (TRIGGER)
      ctx.fillStyle = '#BAE6FD';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(frontHandle - 1, bottomHead + sH * 0.04, sW * 0.08, sH * 0.12, [0, 4, 4, 0]);
      ctx.fill();
      ctx.stroke();

      // 5. MÀN HÌNH LCD KỸ THUẬT SỐ NẰM GỌN TRÊN ĐẦU SÚNG
      const scrW = sW * 0.44;
      const scrH = sH * 0.32;
      const scrX = -sW * 0.08;
      const scrY = -sH * 0.24;

      // Khung viền màn hình bo tròn màu xanh pastel (#38BDF8)
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(scrX - scrW / 2, scrY - scrH / 2, scrW, scrH, 8);
      ctx.fill();

      // Mặt kính LCD tối màu (#0F172A)
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(scrX - scrW * 0.44, scrY - scrH * 0.42, scrW * 0.88, scrH * 0.84, 6);
      ctx.fill();

      // Dòng số 36.5° hiển thị phát sáng cyan
      ctx.fillStyle = '#38BDF8';
      ctx.font = `bold ${Math.max(10, scrW * 0.28)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('36.5°', scrX, scrY - 2);

      // Chữ C nhỏ màu xanh lá kiểm tra đạt chuẩn
      ctx.fillStyle = '#4ADE80';
      ctx.font = `bold ${Math.max(6, scrW * 0.18)}px sans-serif`;
      ctx.fillText('OK °C', scrX, scrY + scrH * 0.26);

      // 6. DUY NHẤT 1 ĐƯỜNG VIỀN MÀU XANH PASTEL ĐỒNG NHẤT BAO QUANH THÂN MÁY
      // KHÔNG CÓ VIỀN BẠC XÁM, KHÔNG CÓ VIỀN THỨ HAI CẮT THÂN
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = strokeW;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(left + r, topHead);
      ctx.lineTo(rightNozzle - r, topHead);
      ctx.arcTo(rightNozzle, topHead, rightNozzle, topHead + r, r);
      ctx.lineTo(rightNozzle, bottomHead - r);
      ctx.arcTo(rightNozzle, bottomHead, rightNozzle - r, bottomHead, r);
      ctx.lineTo(frontHandle + r + 6, bottomHead);
      ctx.arcTo(frontHandle, bottomHead, frontHandle, bottomHead + r + 4, r);
      ctx.lineTo(frontHandle, bottomHandle - r);
      ctx.arcTo(frontHandle, bottomHandle, frontHandle - r, bottomHandle, r);
      ctx.lineTo(left + r, bottomHandle);
      ctx.arcTo(left, bottomHandle, left, bottomHandle - r, r);
      ctx.lineTo(left, topHead + r);
      ctx.arcTo(left, topHead, left + r, topHead, r);
      ctx.closePath();
      ctx.stroke();

      // 7. KHUÔN MẶT CHIBI DỄ THƯƠNG TRÊN TAY CẦM
      const faceX = (left + frontHandle) / 2;
      const faceY = sH * 0.16;
      drawCuteFace(ctx, faceX, faceY, (frontHandle - left) * 0.82, expression, time);

      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 6: ỐNG NGHE Y TẾ (Stethoscope) - VẼ LẠI CHUẨN MẪU
    // Thiết kế ống nghe bác sĩ nhỏ gọn bo tròn tinh xảo:
    // - Vòng dây dẫn âm thanh uốn cong màu xanh teal/mint mát mắt
    // - Gọng tai kim loại bạc chữ Y với 2 núm tai xám
    // - Chuông nghe kim loại 2 mặt (Chestpiece) sáng bóng
    // - Mặt chibi dễ thương tích hợp ở tâm vòng ống nghe
    // - Viền cùng màu xanh teal (#0D9488) và bạc xám (#94A3B8), KHÔNG CÓ VIỀN ĐEN
    // ====================================================
    case 6: {
      const sW = w;
      const sH = h;

      ctx.save();
      // 1. Dây ống nghe uốn lượn hình chữ U tròn đầy màu xanh ngọc teal (#14B8A6)
      ctx.strokeStyle = '#14B8A6';
      ctx.lineWidth = sW * 0.12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-sW * 0.28, -sH * 0.12);
      ctx.bezierCurveTo(-sW * 0.32, sH * 0.52, sW * 0.24, sH * 0.52, sW * 0.24, -sH * 0.02);
      ctx.stroke();

      // Viền cùng màu xanh ngọc đậm cho dây ống nghe (#0D9488)
      ctx.strokeStyle = '#0D9488';
      ctx.lineWidth = strokeW * 0.8;
      ctx.beginPath();
      ctx.arc(0, sH * 0.18, sW * 0.34, 0.1 * Math.PI, 0.9 * Math.PI, false);
      ctx.stroke();

      // 2. Hai gọng kim loại chữ Y phía trên nối với núm tai nghe
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = sW * 0.085;
      ctx.beginPath();
      ctx.moveTo(-sW * 0.16, -sH * 0.16);
      ctx.lineTo(-sW * 0.16, -sH * 0.38);
      ctx.lineTo(-sW * 0.07, -sH * 0.44);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sW * 0.16, -sH * 0.16);
      ctx.lineTo(sW * 0.16, -sH * 0.38);
      ctx.lineTo(sW * 0.07, -sH * 0.44);
      ctx.stroke();

      // Viền cùng màu bạc cho gọng kim loại
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Hai nút tai nghe màu xám bạc mềm (#64748B)
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(-sW * 0.07, -sH * 0.44, sW * 0.085, 0, Math.PI * 2);
      ctx.arc(sW * 0.07, -sH * 0.44, sW * 0.085, 0, Math.PI * 2);
      ctx.fill();

      // Khớp nối ống nghe màu xanh ngọc đậm
      ctx.fillStyle = '#0D9488';
      ctx.beginPath();
      ctx.roundRect(-sW * 0.2, -sH * 0.24, sW * 0.09, sH * 0.14, 3);
      ctx.roundRect(sW * 0.11, -sH * 0.24, sW * 0.09, sH * 0.14, 3);
      ctx.fill();

      // 3. Chuông nghe kim loại (Chestpiece) 2 tầng sáng bóng bên trái
      const bellX = -sW * 0.3;
      const bellY = -sH * 0.14;
      const bellR = sW * 0.18;

      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(bellX, bellY, bellR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.arc(bellX, bellY, bellR * 0.68, 0, Math.PI * 2);
      ctx.fill();

      // 4. Miếng đệm nơ trung tâm tròn dễ thương màu hồng san hô (#FB7185)
      const bowW = sW * 0.58;
      const bowH = sH * 0.38;
      const bowY = sH * 0.02;

      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.roundRect(-bowW / 2, bowY - bowH / 2, bowW, bowH, 16);
      ctx.fill();

      // Viền cùng màu hồng đậm cho nơ
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = strokeW;
      ctx.stroke();

      // Khớp giữ trung tâm
      ctx.fillStyle = '#0D9488';
      ctx.beginPath();
      ctx.roundRect(-sW * 0.07, bowY + bowH / 2 - 2, sW * 0.14, sH * 0.1, 3);
      ctx.fill();

      // Mặt chibi vui tươi trên miếng đệm trung tâm
      drawCuteFace(ctx, 0, bowY, bowW * 0.65, expression, time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 7: MÁY KẸP SpO2 (Pulse Oximeter) - VẼ LẠI CHUẨN MẪU
    // Thiết kế máy kẹp đo nồng độ oxy SpO2 đầu ngón tay:
    // - Vỏ kẹp bo tròn màu xanh dương cyan tươi (#0284C7 / #38BDF8)
    // - Màn hình OLED hiển thị nhịp tim đỏ ♥ và chỉ số oxy 98%
    // - Nút bấm tròn màu trắng và khe đệm ngón tay silicon
    // - Viền cùng màu xanh dương cyan (#0284C7), TUYỆT ĐỐI KHÔNG CÓ VIỀN ĐEN
    // ====================================================
    case 7: {
      const pW = w;
      const pH = h;

      ctx.save();
      // 1. Ngón tay màu da đào mềm (#FED7AA) lấp ló ở khe kẹp dưới
      const fingerW = pW * 0.52;
      const fingerH = pH * 0.36;
      const fingerY = pH * 0.32;
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.roundRect(-fingerW / 2, fingerY - fingerH / 2, fingerW, fingerH, [0, 0, 14, 14]);
      ctx.fill();

      // Viền ngón tay màu cam đào nhẹ
      ctx.strokeStyle = '#FDBA74';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Móng tay hồng hào
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.roundRect(-fingerW * 0.28, fingerY + fingerH * 0.08, fingerW * 0.56, fingerH * 0.25, 4);
      ctx.fill();

      // 2. Thân máy kẹp SpO2 chính màu xanh cyan (#0284C7)
      const bodyH = pH * 0.74;
      const bodyY = -pH * 0.1;
      ctx.beginPath();
      ctx.roundRect(-pW / 2, bodyY - bodyH / 2, pW, bodyH, [16, 16, 22, 22]);
      ctx.fillStyle = config.color; // #02AEFA / #0284C7
      ctx.fill();

      // Gờ đệm kẹp màu trắng trên đỉnh
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(-pW * 0.36, bodyY - bodyH / 2, pW * 0.72, bodyH * 0.12, [6, 6, 0, 0]);
      ctx.fill();

      // 3. Màn hình OLED hiển thị thông số nhịp tim
      const scrW = pW * 0.72;
      const scrH = bodyH * 0.52;
      const scrY = bodyY - bodyH * 0.08;
      ctx.fillStyle = '#0B2545'; // Nền màn hình tối màu OLED
      ctx.beginPath();
      ctx.roundRect(-scrW / 2, scrY - scrH / 2, scrW, scrH, 10);
      ctx.fill();

      // Trái tim đỏ nhấp nháy trên màn hình
      const heartSize = scrW * 0.28;
      const heartX = -scrW * 0.24;
      const heartY = scrY;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(heartX, heartY + heartSize * 0.5);
      ctx.bezierCurveTo(heartX - heartSize * 0.8, heartY, heartX - heartSize * 0.8, heartY - heartSize * 0.6, heartX, heartY - heartSize * 0.2);
      ctx.bezierCurveTo(heartX + heartSize * 0.8, heartY - heartSize * 0.6, heartX + heartSize * 0.8, heartY, heartX, heartY + heartSize * 0.5);
      ctx.fill();

      // Chỉ số SpO2 98% phát sáng màu xanh cyan
      ctx.fillStyle = '#38BDF8';
      ctx.font = `bold ${Math.max(10, scrW * 0.32)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('98%', scrW * 0.2, scrY - 2);

      // Chữ SpO2 nhỏ màu vàng chanh
      ctx.fillStyle = '#FACC15';
      ctx.font = `bold ${Math.max(6, scrW * 0.16)}px sans-serif`;
      ctx.fillText('%SpO2', scrW * 0.2, scrY + scrH * 0.26);

      // Nút bấm tròn màu trắng ở dưới màn hình
      const btnY = bodyY + bodyH * 0.32;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, btnY, pW * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // 4. Viền cùng màu xanh dương cyan (#0284C7) đồng nhất, loại bỏ hoàn toàn viền đen
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(-pW / 2, bodyY - bodyH / 2, pW, bodyH, [16, 16, 22, 22]);
      ctx.stroke();

      // Khuôn mặt chibi ở phần dưới thân máy
      drawCuteFace(ctx, 0, btnY, pW * 0.65, expression, time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 8: MÁY ĐO HUYẾT ÁP (Blood Pressure Monitor) - VẼ LẠI CHUẨN MẪU
    // Thiết kế máy đo huyết áp điện tử để bàn hoàn chỉnh:
    // - Hộp máy chính màu trắng ngà y tế bo tròn mềm
    // - Màn hình LCD lớn hiển thị số 120 / 80 và nhịp tim
    // - Nút bấm START/STOP to màu xanh dương
    // - Dây dẫn khí uốn lượn nối sang vòng bít quấn tay (Cuff) màu xanh xám sẫm
    // - Viền cùng màu xám bạc (#CBD5E1) và cuff (#334155), TUYỆT ĐỐI KHÔNG DÙNG VIỀN ĐEN
    // ====================================================
    case 8: {
      const bW = w;
      const bH = h;

      ctx.save();
      // 1. Dây cao su dẫn khí màu xanh teal (#14B8A6) uốn cong từ cuff vào thân máy
      ctx.strokeStyle = '#14B8A6';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-bW * 0.36, -bH * 0.05);
      ctx.bezierCurveTo(-bW * 0.52, bH * 0.45, -bW * 0.05, bH * 0.45, -bW * 0.05, bH * 0.15);
      ctx.stroke();

      // Viền dây cao su đồng màu
      ctx.strokeStyle = '#0D9488';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 2. Vòng bít quấn bắp tay (Cuff) màu xanh xám sẫm (#334155) đặt nghiêng bên cạnh
      ctx.save();
      ctx.translate(-bW * 0.28, -bH * 0.08);
      ctx.rotate(-0.35);

      const cuffW = bW * 0.34;
      const cuffH = bH * 0.54;
      ctx.beginPath();
      ctx.roundRect(-cuffW / 2, -cuffH / 2, cuffW, cuffH, 12);
      ctx.fillStyle = '#334155';
      ctx.fill();

      // Viền cùng màu xanh than sẫm tự nhiên cho vòng bít
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = strokeW;
      ctx.stroke();

      // Vạch nhám dán dính Velcro và mũi tên chỉ dẫn quấn tay
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-cuffW * 0.38, -cuffH * 0.35, cuffW * 0.76, cuffH * 0.2, 4);
      ctx.fill();
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INDEX ➔', 0, -cuffH * 0.22);
      ctx.restore();

      // 3. Thân máy chính màu trắng ngà y tế (#F8FAFC)
      const mX = bW * 0.12;
      const mW = bW * 0.64;
      const mH = bH * 0.82;
      ctx.beginPath();
      ctx.roundRect(mX - mW / 2, -mH / 2, mW, mH, 16);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();

      // 4. Màn hình lớn LCD màu xanh trời tươi (#E0F2FE)
      const scrW = mW * 0.8;
      const scrH = mH * 0.5;
      const scrX = mX;
      const scrY = -mH * 0.16;
      ctx.beginPath();
      ctx.roundRect(scrX - scrW / 2, scrY - scrH / 2, scrW, scrH, 10);
      ctx.fillStyle = '#E0F2FE';
      ctx.fill();
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Hiển thị chỉ số huyết áp 120 / 80 sắc nét
      ctx.fillStyle = '#0369A1';
      ctx.font = `bold ${Math.max(10, scrW * 0.3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('120/80', scrX, scrY - 4);

      // Nhịp tim PULSE 75 ♥
      ctx.fillStyle = '#EF4444';
      ctx.font = `bold ${Math.max(7, scrW * 0.18)}px sans-serif`;
      ctx.fillText('♥ 75 bpm', scrX, scrY + scrH * 0.28);

      // 5. Nút bấm START/STOP to màu xanh dương (#0284C7)
      const btnY = mH * 0.24;
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.roundRect(mX - mW * 0.32, btnY - mH * 0.12, mW * 0.64, mH * 0.2, 8);
      ctx.fill();

      // Chữ START trên nút
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(8, mW * 0.18)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('START', mX, btnY);

      // 6. Viền cùng màu kem xám nhạt (#CBD5E1) tự nhiên, KHÔNG CÓ VIỀN ĐEN
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(mX - mW / 2, -mH / 2, mW, mH, 16);
      ctx.stroke();

      // Khuôn mặt chibi trên màn hình LCD
      drawCuteFace(ctx, scrX, scrY + scrH * 0.1, scrW * 0.65, expression, time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 9: TÚI CẤP CỨU (First Aid Trauma Kit)
    // Vali túi đỏ rực rỡ, viền đỏ đô sẫm đồng nhất, không có viền đen
    // ====================================================
    case 9: {
      const kitW = w;
      const kitH = h;
      const kitR = config.chamferRadius * scale * fitScale;

      ctx.save();
      // Quai xách màu đỏ sẫm trên đỉnh
      ctx.fillStyle = '#991B1B';
      ctx.strokeStyle = '#7F1D1D';
      ctx.lineWidth = strokeW * 0.8;
      ctx.beginPath();
      ctx.roundRect(-kitW * 0.24, -kitH * 0.68, kitW * 0.48, kitH * 0.32, [8, 8, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Thân túi vali màu đỏ tươi
      ctx.beginPath();
      ctx.roundRect(-kitW / 2, -kitH / 2, kitW, kitH, kitR);
      ctx.fillStyle = config.color; // #EF4444
      ctx.fill();

      // Dấu chữ thập y tế màu trắng dày và to ở giữa
      const crossW = kitW * 0.18;
      const crossH = kitH * 0.54;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-crossW / 2, -crossH / 2, crossW, crossH);
      ctx.fillRect(-crossH / 2, -crossW / 2, crossH, crossW);

      // Viền cùng màu đỏ đô sẫm đồng nhất (KHÔNG DÙNG VIỀN ĐEN)
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(-kitW / 2, -kitH / 2, kitW, kitH, kitR);
      ctx.stroke();

      // Highlight bóng cong góc trên
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.roundRect(-kitW * 0.44, -kitH * 0.42, kitW * 0.25, kitH * 0.25, 6);
      ctx.fill();

      // Khuôn mặt chibi hào hứng
      drawCuteFace(ctx, 0, kitH * 0.22, kitW * 0.55, 'merge_excited', time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 10: MÁY SỐC TIM (Defibrillator) - THEO ẢNH MẪU defibrillator.png
    // Thân máy trắng ngà, màn hình xanh có biểu cảm, hai tay cầm sốc điện phát tia sét vàng
    // Viền xám bạc y tế tự nhiên, không viền đen đậm, khối liền mạch duy nhất
    // ====================================================
    case 10: {
      const dW = w;
      const dH = h;

      ctx.save();
      // 1. DÂY CÁP ĐIỆN VÀ HAI TAY CẦM ĐIỆN CỰC (PADDLES)
      // Hai dây cáp màu xám đậm uốn vòng từ hai bên thân máy lên trên
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = Math.max(3.5, dW * 0.08);
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Dây trái
      ctx.moveTo(-dW * 0.35, dH * 0.15);
      ctx.bezierCurveTo(-dW * 0.55, -dH * 0.1, -dW * 0.42, -dH * 0.42, -dW * 0.28, -dH * 0.36);
      ctx.stroke();
      // Dây phải
      ctx.beginPath();
      ctx.moveTo(dW * 0.35, dH * 0.15);
      ctx.bezierCurveTo(dW * 0.55, -dH * 0.1, dW * 0.42, -dH * 0.42, dW * 0.28, -dH * 0.36);
      ctx.stroke();

      // Hai tay cầm điện cực sốc tim (Paddles) đối xứng hai bên đỉnh máy
      const pW = dW * 0.24;
      const pH = dH * 0.26;

      // Tay cầm trái
      ctx.save();
      ctx.translate(-dW * 0.25, -dH * 0.35);
      ctx.fillStyle = '#E2E8F0';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = strokeW * 0.7;
      ctx.beginPath();
      ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 6);
      ctx.fill();
      ctx.stroke();
      // Mặt bản cực kim loại bên trong
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(pW * 0.15, -pH * 0.35, pW * 0.3, pH * 0.7, 3);
      ctx.fill();
      ctx.restore();

      // Tay cầm phải
      ctx.save();
      ctx.translate(dW * 0.25, -dH * 0.35);
      ctx.fillStyle = '#E2E8F0';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = strokeW * 0.7;
      ctx.beginPath();
      ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 6);
      ctx.fill();
      ctx.stroke();
      // Mặt bản cực kim loại bên trong
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-pW * 0.45, -pH * 0.35, pW * 0.3, pH * 0.7, 3);
      ctx.fill();
      ctx.restore();

      // Tia sét điện màu vàng chanh nối giữa 2 bản cực
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = Math.max(3, dW * 0.055);
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      const sparkY = -dH * 0.35;
      ctx.moveTo(-dW * 0.16, sparkY);
      ctx.lineTo(-dW * 0.06, sparkY - 10);
      ctx.lineTo(0, sparkY + 6);
      ctx.lineTo(dW * 0.06, sparkY - 10);
      ctx.lineTo(dW * 0.16, sparkY);
      ctx.stroke();

      // Điểm sáng vàng nhấp nháy ở các đỉnh tia sét
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, sparkY + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. THÂN MÁY CHÍNH (MAIN DEFIBRILLATOR UNIT)
      // Thân máy bo tròn mềm mại màu trắng xám y tế (#F8FAFC)
      const bodyW = dW * 0.76;
      const bodyH = dH * 0.62;
      const bodyY = dH * 0.14;
      ctx.beginPath();
      ctx.roundRect(-bodyW / 2, bodyY - bodyH / 2, bodyW, bodyH, 18);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();

      // Viền cùng màu xám bạc y tế mềm (#94A3B8)
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = strokeW;
      ctx.stroke();

      // 3. MÀN HÌNH LCD XANH PASTEL CÓ BIỂU CẢM
      const scrW = bodyW * 0.76;
      const scrH = bodyH * 0.54;
      const scrY = bodyY - bodyH * 0.12;

      ctx.fillStyle = '#93C5FD'; // Xanh pastel sáng giống ảnh mẫu
      ctx.beginPath();
      ctx.roundRect(-scrW / 2, scrY - scrH / 2, scrW, scrH, 12);
      ctx.fill();

      // Viền nhẹ màn hình
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vệt sáng chéo trên mặt kính màn hình
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-scrW * 0.4, scrY - scrH * 0.45);
      ctx.lineTo(-scrW * 0.1, scrY - scrH * 0.45);
      ctx.lineTo(-scrW * 0.35, scrY + scrH * 0.45);
      ctx.lineTo(-scrW * 0.45, scrY + scrH * 0.45);
      ctx.closePath();
      ctx.fill();

      // 4. TRẠNG THÁI CẢM XÚC ROBOT/CHIBI TRÊN MÀN HÌNH
      const eyeDist = scrW * 0.36;
      const eyeW = Math.max(3.5, scrW * 0.12);
      const eyeH = Math.max(7, scrH * 0.32);

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';

      if (expression === 'squished') {
        // Mắt nhắm > <
        ctx.beginPath();
        ctx.moveTo(-eyeDist / 2 - 4, scrY - 4); ctx.lineTo(-eyeDist / 2 + 3, scrY); ctx.lineTo(-eyeDist / 2 - 4, scrY + 4);
        ctx.moveTo(eyeDist / 2 + 4, scrY - 4); ctx.lineTo(eyeDist / 2 - 3, scrY); ctx.lineTo(eyeDist / 2 + 4, scrY + 4);
        ctx.stroke();
        // Miệng lượn sóng
        ctx.beginPath();
        ctx.moveTo(-4, scrY + 5); ctx.lineTo(0, scrY + 3); ctx.lineTo(4, scrY + 5);
        ctx.stroke();
      } else if (expression === 'merge_excited') {
        // Mắt cười híp mí cong tròn ^ ^
        ctx.beginPath();
        ctx.arc(-eyeDist / 2, scrY, 5, Math.PI, 0);
        ctx.arc(eyeDist / 2, scrY, 5, Math.PI, 0);
        ctx.stroke();
        // Miệng cười hở răng
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.arc(0, scrY + 3, 4, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (expression === 'falling') {
        // Mắt dạng con nhộng dọc to và miệng tròn chữ O ngạc nhiên (chuẩn ảnh mẫu defibrillator.png)
        ctx.beginPath();
        ctx.roundRect(-eyeDist / 2 - eyeW / 2, scrY - eyeH / 2, eyeW, eyeH, eyeW / 2);
        ctx.roundRect(eyeDist / 2 - eyeW / 2, scrY - eyeH / 2, eyeW, eyeH, eyeW / 2);
        ctx.fill();
        // Miệng tròn chữ O màu xám đậm
        ctx.beginPath();
        ctx.arc(0, scrY + 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Trạng thái happy: Mắt viên nhộng dọc + miệng cười chúm chím
        ctx.beginPath();
        ctx.roundRect(-eyeDist / 2 - eyeW / 2, scrY - eyeH / 2, eyeW, eyeH, eyeW / 2);
        ctx.roundRect(eyeDist / 2 - eyeW / 2, scrY - eyeH / 2, eyeW, eyeH, eyeW / 2);
        ctx.fill();
        // Miệng cười mỉm
        ctx.beginPath();
        ctx.arc(0, scrY + 1, 4, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Má hồng đào
        ctx.fillStyle = 'rgba(251, 113, 133, 0.6)';
        ctx.beginPath();
        ctx.arc(-eyeDist / 2 - 6, scrY + 5, 2.5, 0, Math.PI * 2);
        ctx.arc(eyeDist / 2 + 6, scrY + 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. HAI NÚT BẤM DƯỚI MÀN HÌNH (Vàng & Cam đỏ san hô theo ảnh mẫu)
      const btnY = bodyY + bodyH * 0.3;
      // Nút trái: Vàng
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(-bodyW * 0.14, btnY, bodyW * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Nút phải: Cam đỏ san hô
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(bodyW * 0.14, btnY, bodyW * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 11: GIƯỜNG BỆNH VIỆN (Hospital Bed) - THEO ẢNH MẪU hospital-bed.png
    // Giường bệnh nhân ICU: nệm xanh, khung vàng kem, cột truyền dịch và monitor nhịp tim
    // Viền cùng màu tự nhiên, khối liền mạch duy nhất
    // ====================================================
    case 11: {
      const bW = w;
      const bH = h;

      ctx.save();
      // 1. CỘT TREO DỊCH TRUYỀN (IV STAND) PHÍA SAU BÊN TRÁI
      const ivX = -bW * 0.35;
      const ivTopY = -bH * 0.44;
      const ivBottomY = bH * 0.28;

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = Math.max(2.5, bW * 0.04);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ivX, ivBottomY);
      ctx.lineTo(ivX, ivTopY);
      // Móc treo chữ U uốn sang phải
      ctx.lineTo(ivX + bW * 0.14, ivTopY);
      ctx.arc(ivX + bW * 0.14, ivTopY + 6, 6, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();

      // Túi dịch truyền/máu màu đỏ san hô trong suốt (#FB7185)
      const bagX = ivX + bW * 0.14;
      const bagY = ivTopY + 16;
      const bagW = bW * 0.14;
      const bagH = bH * 0.22;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(bagX - bagW / 2, bagY, bagW, bagH, [3, 3, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Mức dịch máu đỏ bên trong túi
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.roundRect(bagX - bagW / 2 + 1, bagY + bagH * 0.35, bagW - 2, bagH * 0.62, [0, 0, 5, 5]);
      ctx.fill();

      // 2. MÀN HÌNH THEO DÕI NHỊP TIM (PATIENT MONITOR) BÊN PHẢI
      const monX = bW * 0.26;
      const monY = -bH * 0.28;
      const monW = bW * 0.38;
      const monH = bH * 0.36;

      // Cột đỡ monitor
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = Math.max(3, bW * 0.045);
      ctx.beginPath();
      ctx.moveTo(monX, bH * 0.05);
      ctx.lineTo(monX, monY + monH / 2);
      ctx.stroke();

      // Vỏ khung monitor màu xám slate
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.roundRect(monX - monW / 2, monY - monH / 2, monW, monH, 8);
      ctx.fill();

      // Mặt kính màn hình màu xanh pastel (#93C5FD)
      ctx.fillStyle = '#93C5FD';
      ctx.beginPath();
      ctx.roundRect(monX - monW * 0.42, monY - monH * 0.4, monW * 0.84, monH * 0.8, 6);
      ctx.fill();

      // Đường sóng điện tim ECG màu trắng nhịp nhàng
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(monX - monW * 0.36, monY + 2);
      ctx.lineTo(monX - monW * 0.2, monY + 2);
      ctx.lineTo(monX - monW * 0.1, monY - 8);
      ctx.lineTo(monX, monY + 8);
      ctx.lineTo(monX + monW * 0.08, monY - 4);
      ctx.lineTo(monX + monW * 0.16, monY + 2);
      ctx.stroke();

      // Biểu tượng trái tim màu trắng bên góc phải màn hình
      const heartX = monX + monW * 0.24;
      const heartY = monY;
      const hSz = monW * 0.14;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(heartX, heartY + hSz * 0.7);
      ctx.bezierCurveTo(heartX - hSz * 1.1, heartY + hSz * 0.1, heartX - hSz * 1.1, heartY - hSz * 0.7, heartX, heartY - hSz * 0.2);
      ctx.bezierCurveTo(heartX + hSz * 1.1, heartY - hSz * 0.7, heartX + hSz * 1.1, heartY + hSz * 0.1, heartX, heartY + hSz * 0.7);
      ctx.fill();

      // 3. THÂN GIƯỜNG VÀ NỆM Y TẾ
      // Đệm giường nệm màu xanh dương (#60A5FA), góc nghiêng dốc phần đầu
      const bedY = bH * 0.08;
      ctx.fillStyle = '#60A5FA';
      ctx.beginPath();
      // Phần gối đầu dốc nghiêng bên trái
      ctx.moveTo(-bW * 0.45, -bH * 0.08);
      ctx.lineTo(-bW * 0.2, bedY);
      // Mặt phẳng nệm nằm
      ctx.lineTo(bW * 0.36, bedY);
      ctx.lineTo(bW * 0.36, bedY + bH * 0.12);
      ctx.lineTo(-bW * 0.2, bedY + bH * 0.12);
      ctx.lineTo(-bW * 0.45, bedY - bH * 0.08);
      ctx.closePath();
      ctx.fill();

      // Nền trắng đệm dưới giường
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(-bW * 0.46, bedY + bH * 0.1, bW * 0.92, bH * 0.1, 4);
      ctx.fill();

      // 4. KHUNG ĐẾ VÀNG VÀ BÁNH XE LĂN
      // Thanh đế ngang màu vàng kem ấm áp (#FDE68A)
      const baseW = bW * 0.88;
      const baseH = bH * 0.14;
      const baseY = bH * 0.26;
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.roundRect(-baseW / 2, baseY, baseW, baseH, 6);
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = strokeW * 0.8;
      ctx.stroke();

      // Hai chân chống và 2 bánh xe tròn màu xám (#64748B)
      [-baseW * 0.36, baseW * 0.36].forEach((wheelX) => {
        // Trục chân
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(wheelX, baseY + baseH);
        ctx.lineTo(wheelX, baseY + baseH + 6);
        ctx.stroke();

        // Bánh xe
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.arc(wheelX, baseY + baseH + 11, bW * 0.055, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. THANH CHẮN AN TOÀN (GUARDRAIL)
      const railW = bW * 0.48;
      const railH = bH * 0.22;
      const railX = -bW * 0.05;
      const railY = bedY - bH * 0.02;

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.roundRect(railX - railW / 2, railY, railW, railH, [8, 8, 0, 0]);
      ctx.stroke();

      // Các thanh dọc chắn
      [-railW * 0.2, railW * 0.15].forEach((rx) => {
        ctx.beginPath();
        ctx.moveTo(railX + rx, railY);
        ctx.lineTo(railX + rx, railY + railH);
        ctx.stroke();
      });

      // 6. KHUÔN MẶT CẢM XÚC CHIBI TRÊN NỆM GIƯỜNG
      drawCuteFace(ctx, -bW * 0.05, bedY + 3, bW * 0.45, expression, time);
      ctx.restore();
      break;
    }

    // ====================================================
    // LEVEL 12: XE CỨU THƯƠNG (Ambulance) - THEO ẢNH MẪU IMG_0927.png
    // Xe cứu thương kawaii tối thượng: mắt long lanh kim cương, còi đèn cấp cứu, má hồng mèo w
    // Viền nâu xám mocha mềm mại (#78716C), không viền đen đậm, khối liền mạch duy nhất
    // ====================================================
    case 12: {
      const aW = w;
      const aH = h;

      ctx.save();
      // 1. HAI BÁNH XE XÁM ĐẬM BÊN DƯỚI
      const wheelW = aW * 0.18;
      const wheelH = aH * 0.12;
      const wheelY = aH * 0.42;

      ctx.fillStyle = '#44403C';
      ctx.beginPath();
      ctx.roundRect(-aW * 0.35, wheelY, wheelW, wheelH, 5);
      ctx.roundRect(aW * 0.35 - wheelW, wheelY, wheelW, wheelH, 5);
      ctx.fill();

      // 2. HAI GƯƠNG CHIẾU HẬU TRÒN HAI BÊN HÔNG XE
      const mirrorR = aW * 0.075;
      const mirrorY = -aH * 0.02;
      ctx.fillStyle = '#94A3B8';
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = strokeW * 0.7;
      ctx.beginPath();
      ctx.arc(-aW * 0.46, mirrorY, mirrorR, 0, Math.PI * 2);
      ctx.arc(aW * 0.46, mirrorY, mirrorR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. THÂN XE CẤP CỨU MÀU TRẮNG TUYẾT (#FFFFFF) BO TRÒN NGUYÊN KHỐI
      const bodyW = aW * 0.88;
      const bodyH = aH * 0.88;
      const bodyY = 0;
      const bodyR = 24;

      ctx.beginPath();
      ctx.roundRect(-bodyW / 2, bodyY - bodyH / 2, bodyW, bodyH, bodyR);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // 4. HAI VẠCH HỒNG SAN HÔ DỌC HAI BÊN HÔNG THÂN XE
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.roundRect(-bodyW / 2 + 1, aH * 0.02, aW * 0.08, aH * 0.3, [0, 4, 4, 0]);
      ctx.roundRect(bodyW / 2 - aW * 0.08 - 1, aH * 0.02, aW * 0.08, aH * 0.3, [4, 0, 0, 4]);
      ctx.fill();

      // 5. CÒI ĐÈN CẤP CỨU TRÊN NÓC XE (SIREN LIGHTBAR)
      const sirenW = bodyW * 0.54;
      const sirenH = aH * 0.11;
      const sirenY = -bodyH / 2 + sirenH * 0.6;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-sirenW / 2, sirenY - sirenH / 2, sirenW, sirenH, sirenH / 2);
      ctx.fillStyle = '#EF4444'; // Đỏ cấp cứu
      ctx.fill();
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = strokeW * 0.7;
      ctx.stroke();

      // Phần đèn trắng ngà ở giữa còi đèn
      ctx.fillStyle = '#FFFBEB';
      ctx.beginPath();
      ctx.roundRect(-sirenW * 0.22, sirenY - sirenH / 2 + 1, sirenW * 0.44, sirenH - 2, 3);
      ctx.fill();

      // Vệt sáng lấp lánh trên còi đèn
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.roundRect(-sirenW * 0.4, sirenY - sirenH * 0.3, sirenW * 0.2, sirenH * 0.4, 2);
      ctx.fill();
      ctx.restore();

      // 6. HAI TRÁI TIM HỒNG ĐÁNG YÊU Ở HAI GÓC TRÁN XE (theo đúng ảnh mẫu IMG_0927.png)
      const heartSz = bodyW * 0.08;
      [-bodyW * 0.34, bodyW * 0.34].forEach((hx) => {
        const hy = -bodyH * 0.32;
        ctx.fillStyle = '#FB7185';
        ctx.beginPath();
        ctx.moveTo(hx, hy + heartSz * 0.7);
        ctx.bezierCurveTo(hx - heartSz * 1.1, hy + heartSz * 0.1, hx - heartSz * 1.1, hy - heartSz * 0.7, hx, hy - heartSz * 0.2);
        ctx.bezierCurveTo(hx + heartSz * 1.1, hy - heartSz * 0.7, hx + heartSz * 1.1, hy + heartSz * 0.1, hx, hy + heartSz * 0.7);
        ctx.fill();
        ctx.strokeStyle = '#78716C';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // 7. KÍNH CHẮN GIÓ LỚN MÀU XANH DA TRỜI SÁNG (#E0F2FE)
      const windW = bodyW * 0.8;
      const windH = bodyH * 0.48;
      const windY = -bodyH * 0.04;

      ctx.beginPath();
      ctx.roundRect(-windW / 2, windY - windH / 2, windW, windH, [18, 18, 10, 10]);
      ctx.fillStyle = '#E0F2FE';
      ctx.fill();
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = strokeW * 0.8;
      ctx.stroke();

      // Vệt bóng phản quang trên kính
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.moveTo(-windW * 0.25, windY - windH / 2 + 3);
      ctx.lineTo(windW * 0.05, windY - windH / 2 + 3);
      ctx.lineTo(-windW * 0.15, windY + windH / 2 - 3);
      ctx.lineTo(-windW * 0.4, windY + windH / 2 - 3);
      ctx.closePath();
      ctx.fill();

      // 8. ĐÔI MẮT THIÊN THẦN KIM CƯƠNG LẤP LÁNH VÀ MIỆNG MÈO w (theo đúng ảnh mẫu IMG_0927.png)
      const eyeSpacing = windW * 0.38;
      const eyeY = windY + windH * 0.15;
      const eyeR = Math.max(7, windW * 0.14);

      if (expression === 'squished') {
        // Mắt nhắm > <
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing / 2 - 6, eyeY - 6); ctx.lineTo(-eyeSpacing / 2 + 5, eyeY); ctx.lineTo(-eyeSpacing / 2 - 6, eyeY + 6);
        ctx.moveTo(eyeSpacing / 2 + 6, eyeY - 6); ctx.lineTo(eyeSpacing / 2 - 5, eyeY); ctx.lineTo(eyeSpacing / 2 + 6, eyeY + 6);
        ctx.stroke();
      } else if (expression === 'merge_excited') {
        // Mắt híp mí cười tít ^ ^
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-eyeSpacing / 2, eyeY, eyeR * 0.8, Math.PI, 0);
        ctx.arc(eyeSpacing / 2, eyeY, eyeR * 0.8, Math.PI, 0);
        ctx.stroke();
      } else if (expression === 'falling') {
        // Mắt tròn to ngạc nhiên
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.arc(-eyeSpacing / 2, eyeY, eyeR * 0.9, 0, Math.PI * 2);
        ctx.arc(eyeSpacing / 2, eyeY, eyeR * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-eyeSpacing / 2 + 2, eyeY - 2, 3, 0, Math.PI * 2);
        ctx.arc(eyeSpacing / 2 + 2, eyeY - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Đôi mắt to tròn long lanh với kim cương lấp lánh (chuẩn ảnh mẫu)
        [-eyeSpacing / 2, eyeSpacing / 2].forEach((ex) => {
          // Tròng đen mắt
          ctx.fillStyle = '#292524';
          ctx.beginPath();
          ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fill();

          // Hai hàng lông mi cong dễ thương
          ctx.strokeStyle = '#292524';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          if (ex < 0) {
            ctx.moveTo(ex - eyeR * 0.8, eyeY - eyeR * 0.3); ctx.lineTo(ex - eyeR * 1.3, eyeY - eyeR * 0.6);
            ctx.moveTo(ex - eyeR * 0.6, eyeY - eyeR * 0.7); ctx.lineTo(ex - eyeR * 1.1, eyeY - eyeR * 1.1);
          } else {
            ctx.moveTo(ex + eyeR * 0.8, eyeY - eyeR * 0.3); ctx.lineTo(ex + eyeR * 1.3, eyeY - eyeR * 0.6);
            ctx.moveTo(ex + eyeR * 0.6, eyeY - eyeR * 0.7); ctx.lineTo(ex + eyeR * 1.1, eyeY - eyeR * 1.1);
          }
          ctx.stroke();

          // Ngôi sao / kim cương 4 cánh phát sáng trắng trong mắt (✧)
          ctx.fillStyle = '#FFFFFF';
          const s = eyeR * 0.62;
          ctx.beginPath();
          ctx.moveTo(ex, eyeY - s);
          ctx.quadraticCurveTo(ex, eyeY, ex + s, eyeY);
          ctx.quadraticCurveTo(ex, eyeY, ex, eyeY + s);
          ctx.quadraticCurveTo(ex, eyeY, ex - s, eyeY);
          ctx.quadraticCurveTo(ex, eyeY, ex, eyeY - s);
          ctx.fill();

          // Đốm sáng phụ góc dưới
          ctx.beginPath();
          ctx.arc(ex + (ex < 0 ? -eyeR * 0.35 : eyeR * 0.35), eyeY + eyeR * 0.35, 1.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Má hồng phấn đào có vạch kẻ xinh xắn (chuẩn ảnh mẫu)
      ctx.fillStyle = 'rgba(251, 113, 133, 0.7)';
      [-eyeSpacing / 2 - 8, eyeSpacing / 2 + 8].forEach((bx) => {
        ctx.beginPath();
        ctx.ellipse(bx, eyeY + eyeR * 0.8, eyeR * 0.8, eyeR * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        // Vạch kẻ má hồng
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx - 3, eyeY + eyeR * 0.7); ctx.lineTo(bx - 1, eyeY + eyeR * 0.9);
        ctx.moveTo(bx + 1, eyeY + eyeR * 0.7); ctx.lineTo(bx + 3, eyeY + eyeR * 0.9);
        ctx.stroke();
      });

      // Miệng mèo chúm chím `w` siêu đáng yêu
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      const mouthY = eyeY + eyeR * 0.55;
      ctx.arc(-3.5, mouthY, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.arc(3.5, mouthY, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // 9. PHẦN CA-LĂNG TRƯỚC VÀ ĐÈN PHA MÀU XANH PASTEL
      const grillW = bodyW * 0.82;
      const grillH = bodyH * 0.22;
      const grillY = bodyY + bodyH * 0.24;

      ctx.fillStyle = '#BAE6FD'; // Xanh pastel êm dịu
      ctx.beginPath();
      ctx.roundRect(-grillW / 2, grillY - grillH / 2, grillW, grillH, [6, 6, 12, 12]);
      ctx.fill();
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = strokeW * 0.75;
      ctx.stroke();

      // Các thanh tản nhiệt ngang màu nâu xám
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      [-5, 0, 5].forEach((dy) => {
        ctx.moveTo(-grillW * 0.22, grillY + dy);
        ctx.lineTo(grillW * 0.22, grillY + dy);
      });
      ctx.stroke();

      // Hai đèn pha tròn màu vàng tươi rạng rỡ (#FEF08A)
      const lightR = grillH * 0.32;
      [-grillW * 0.34, grillW * 0.34].forEach((lx) => {
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(lx, grillY, lightR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78716C';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Highlight đèn
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(lx - lightR * 0.3, grillY - lightR * 0.3, lightR * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // 10. CẢN TRƯỚC (BUMPER) BO TRÒN MÀU XÁM NHẠT
      const bumpW = bodyW * 0.86;
      const bumpH = aH * 0.08;
      const bumpY = bodyY + bodyH * 0.38;

      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.roundRect(-bumpW / 2, bumpY - bumpH / 2, bumpW, bumpH, bumpH / 2);
      ctx.fill();
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = strokeW * 0.75;
      ctx.stroke();

      // 11. VIỀN NGUYÊN KHỐI LIỀN MẠCH CHO TOÀN BỘ XE
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.roundRect(-bodyW / 2, bodyY - bodyH / 2, bodyW, bodyH, bodyR);
      ctx.stroke();

      ctx.restore();
      break;
    }
  }

  // VẼ PHỤ KIỆN / HIỆU ỨNG TRANG PHỤC ĐỘC QUYỀN (COSMETIC SKINS)
  if (skin === 'sakura') {
    // 2 cánh hoa đào hồng pastel bay lượn nhẹ nhàng
    ctx.save();
    ctx.fillStyle = '#F472B6';
    const petalTime = time * 0.002;
    const p1X = Math.sin(petalTime) * (w * 0.35) + w * 0.25;
    const p1Y = -h * 0.4 + Math.cos(petalTime) * 3;
    ctx.beginPath();
    ctx.ellipse(p1X, p1Y, Math.max(2.5, w * 0.08), Math.max(1.8, w * 0.05), Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    const p2X = -w * 0.3 + Math.cos(petalTime * 1.3) * 3;
    const p2Y = -h * 0.34 + Math.sin(petalTime * 1.3) * 3;
    ctx.beginPath();
    ctx.ellipse(p2X, p2Y, Math.max(2.2, w * 0.06), Math.max(1.5, w * 0.04), -Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (skin === 'cyber') {
    // Vi mạch điện tử Neon Cyberpunk phát quang ở các góc
    ctx.save();
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = Math.max(1.4, strokeW * 0.7);
    const cornerSize = Math.max(3, Math.min(w, h) * 0.12);
    const halfW = w * 0.46;
    const halfH = h * 0.46;

    // Góc trên trái
    ctx.beginPath();
    ctx.moveTo(-halfW + cornerSize, -halfH);
    ctx.lineTo(-halfW, -halfH);
    ctx.lineTo(-halfW, -halfH + cornerSize);
    ctx.stroke();

    // Góc dưới phải
    ctx.beginPath();
    ctx.moveTo(halfW - cornerSize, halfH);
    ctx.lineTo(halfW, halfH);
    ctx.lineTo(halfW, halfH - cornerSize);
    ctx.stroke();
    ctx.restore();
  } else if (skin === 'royal') {
    // Vương miện hoàng gia vàng kim dát ngọc đỏ mini
    ctx.save();
    const crownW = Math.max(12, Math.min(w * 0.35, 24));
    const crownH = crownW * 0.62;
    const crownY = -h * 0.5 - crownH * 0.45;

    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-crownW / 2, crownY + crownH / 2);
    ctx.lineTo(-crownW / 2, crownY - crownH / 2);
    ctx.lineTo(-crownW * 0.18, crownY);
    ctx.lineTo(0, crownY - crownH * 0.65);
    ctx.lineTo(crownW * 0.18, crownY);
    ctx.lineTo(crownW / 2, crownY - crownH / 2);
    ctx.lineTo(crownW / 2, crownY + crownH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hạt hồng ngọc trung tâm vương miện
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, crownY + crownH * 0.05, Math.max(1.5, crownW * 0.1), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Vẽ ngôi sao nhỏ trang trí / mắt lấp lánh
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fillColor: string,
  strokeColor?: string
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Vẽ tia sáng lấp lánh khi buông tay thả vật phẩm
 */
function drawMiniSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.fill();
  ctx.restore();
}

/**
 * Vẽ Y TÁ CHUỘT HAMSTER / GẤU CHIBI ĐÁNG YÊU THẢ VẬT PHẨM
 * Tái hiện chính xác nhân vật từ hình ảnh vaccination.png:
 * - Lông vàng đào ấm áp, hai má phúng phính hamster có lọn lông mềm
 * - Mũ y tá trắng tinh với chữ thập xanh ngọc (Teal Cyan) đặc trưng
 * - Mũi trái tim hồng đào xinh xắn, vùng mõm kem sáng
 * - Hai má hồng to tròn rạng rỡ
 * - Miệng cười tươi hở răng trắng vui nhộn
 *
 * ĐẦY ĐỦ TRẠNG THÁI BIỂU CẢM & ĐỘNG TÁC THẢ:
 * 1. Idle (Chờ thả): Đu đưa theo nhịp thở nhẹ nhàng, mắt cong vòm vui vẻ ^ ^, thỉnh thoảng chớp mắt.
 * 2. Dropping (Động tác thả vật phẩm):
 *    - Co giật nảy ngược (recoil spring jump) đàn hồi
 *    - Hai bàn tay vung mở bung ra buông vật phẩm, để lộ đệm thịt hồng
 *    - Mắt nhắm tít vui sướng reo vui, miệng há to reo "A!", tai nảy nhẹ
 *    - Phát ra các ngôi sao và tia sáng nhỏ xung quanh tay
 * 3. Overload (Cảnh báo quá tải khi sắp chạm vạch nguy hiểm):
 *    - Mắt tròn lo lắng run rẩy, giọt mồ hôi xanh rơi bên trán, miệng lượn sóng bất an ~
 * 4. High Combo (Khi đạt chuỗi combo x2, x3...):
 *    - Mắt ngôi sao vàng rực rỡ ★ ★, nụ cười rạng rỡ phấn khích
 */
export function drawDoctorDropper(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  currentLevel: number,
  isDropping: boolean,
  dropStartTimeOrTime: number = 0,
  timeOrScale: number = 0,
  scaleFactorArg: number = 1.0,
  isOverflowing: boolean = false,
  combo: number = 1
) {
  let dropStartTime = 0;
  let time = 0;
  let scaleFactor = 1.0;

  // Phân biệt chữ ký bằng số đối số, không dùng mốc thời gian: game có thể mở trước 1 giây.
  if (arguments.length >= 8) {
    dropStartTime = dropStartTimeOrTime;
    time = timeOrScale;
    scaleFactor = scaleFactorArg || 1.0;
  } else {
    time = dropStartTimeOrTime || performance.now();
    scaleFactor = (timeOrScale as number) || 1.0;
    dropStartTime = isDropping ? time - 100 : 0;
  }

  const nurse = getNurseSprite();
  if (nurse) {
    const elapsed = Math.max(0, time - dropStartTime);
    const progress = isDropping ? Math.min(1, elapsed / 420) : 0;
    const bounce = isDropping ? -Math.sin(progress * Math.PI) * 8.5 : Math.sin(time * 0.0035) * 1.5;
    ctx.save();
    ctx.translate(x, y + bounce);
    const imageH = 72, imageW = imageH * nurse.naturalWidth / nurse.naturalHeight;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.save();
    const portraitScale = Math.max(.85, Math.min(1.8, 1.25 * scaleFactor));
    ctx.translate(0, -8);ctx.scale(portraitScale, portraitScale);
    ctx.drawImage(nurse, -imageW / 2, -25, imageW, imageH);
    drawNurseFace(ctx, imageW, imageH, time, isDropping, isOverflowing, combo);
    ctx.restore();
    if (isOverflowing) {
      ctx.fillStyle = '#38BDF8'; ctx.beginPath(); ctx.ellipse(imageW * 0.27, 5, 2, 3.5, -0.3, 0, Math.PI * 2); ctx.fill();
    }
    if (isDropping) {
      ctx.globalAlpha = Math.sin(progress * Math.PI);
      drawMiniSparkle(ctx, -24 - progress * 6, 36, 4, '#F59E0B');
      drawMiniSparkle(ctx, 24 + progress * 6, 36, 4, '#F59E0B');
      ctx.globalAlpha = 1;
    } else {
      const config = getItemConfigByLevel(currentLevel);
      const holdY = 22 + (config.height || config.radius * 2) * 0.42 * scaleFactor;
      drawMedicalMascot(ctx, 0, holdY, currentLevel, Math.sin(time * 0.003) * 0.08 - 0.08, 0.92 * scaleFactor, 'happy', time);
    }
    ctx.restore();
    return;
  }

  // 1. CHUYỂN ĐỘNG NHỊP THỞ & ĐỘNG TÁC THẢ VẬT PHẨM (PHYSICS & ANIMATION)
  const bobY = isDropping ? 0 : Math.sin(time * 0.0035) * 2.2;
  const earWiggle = Math.sin(time * 0.005) * 0.03;

  let recoilY = 0;
  let pawOpenProgress = 0; // 0: ôm vật -> 1: mở bung buông tay thả vật
  let earRecoil = 0;

  if (isDropping) {
    const elapsed = Math.max(0, time - dropStartTime);
    const dropDuration = 420; // Khớp với timeout reset dropper trong GameBoard
    const p = Math.min(1.0, elapsed / dropDuration);

    // Chuyển động nảy ngược (recoil jump): bật lên rồi đáp xuống êm ái
    recoilY = -Math.sin(p * Math.PI) * 8.5;
    earRecoil = -Math.sin(p * Math.PI) * 0.15;

    // Tiến độ vung mở tay thả
    if (p < 0.35) {
      pawOpenProgress = p / 0.35;
    } else if (p < 0.72) {
      pawOpenProgress = 1.0;
    } else {
      pawOpenProgress = 1.0 - (p - 0.72) / 0.28;
    }
  }

  ctx.save();
  ctx.translate(x, y + bobY);

  // MÀU SẮC CHUẨN THEO ẢNH VACCINATION.PNG
  const furColor = '#F7BD89';        // Lông vàng đào ấm áp
  const furHighlight = '#FDE8D4';    // Vùng sáng đầu
  const furOutline = '#C87A4A';      // Viền mềm nâu caramel ấm, không dùng viền đen thô
  const earInner = '#FFF0E2';        // Lòng tai kem đào
  const capColor = '#FFFFFF';        // Mũ y tá trắng tinh
  const crossColor = '#06B6D4';      // Chữ thập xanh ngọc Cyan Teal
  const snoutColor = '#FFF6EC';      // Vùng mõm kem sáng
  const noseColor = '#F43F5E';       // Mũi trái tim hồng thắm
  const blushColor = '#FB7185';      // Má hồng tròn
  const mouthDark = '#334155';       // Nét viền than chì mềm mại
  const mouthInside = '#F43F5E';     // Khoang miệng hồng đào

  // 2. HAI TAI TRÒN ĐÁNG YÊU (EARS)
  // Tai trái
  ctx.save();
  ctx.translate(-22, -26 + recoilY);
  ctx.rotate(-0.15 + earWiggle + (isOverflowing ? 0.2 : earRecoil));
  ctx.fillStyle = furColor;
  ctx.strokeStyle = furOutline;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 12.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Lòng tai trong
  ctx.fillStyle = earInner;
  ctx.beginPath();
  ctx.arc(1, 1, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tai phải
  ctx.save();
  ctx.translate(22, -26 + recoilY);
  ctx.rotate(0.15 - earWiggle - (isOverflowing ? 0.2 : earRecoil));
  ctx.fillStyle = furColor;
  ctx.strokeStyle = furOutline;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 12.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Lòng tai trong
  ctx.fillStyle = earInner;
  ctx.beginPath();
  ctx.arc(-1, 1, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. MŨ Y TÁ CHỮ THẬP XANH NGỌC TEAL (NURSE CAP)
  ctx.save();
  ctx.translate(0, -32 + recoilY * 0.7);
  // Thân mũ trắng bo góc trên
  ctx.fillStyle = capColor;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-14, -14, 28, 17, [7, 7, 2, 2]);
  ctx.fill();
  ctx.stroke();

  // Chữ thập xanh ngọc Cyan Teal trên mũ
  ctx.fillStyle = crossColor;
  // Thanh dọc
  ctx.beginPath();
  ctx.roundRect(-3, -11, 6, 11, 1.5);
  ctx.fill();
  // Thanh ngang
  ctx.beginPath();
  ctx.roundRect(-6.5, -8.5, 13, 6, 1.5);
  ctx.fill();
  ctx.restore();

  // 4. KHUÔN MẶT HAMSTER VỚI HAI GÒ MÁ PHÚNG PHÍNH (CHUBBY CHEEK TUFTS)
  ctx.save();
  ctx.translate(0, recoilY);
  ctx.fillStyle = furColor;
  ctx.strokeStyle = furOutline;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // Đỉnh đầu
  ctx.moveTo(-16, -26);
  ctx.bezierCurveTo(-8, -30, 8, -30, 16, -26);
  // Thái dương phải xuống gò má phải
  ctx.bezierCurveTo(24, -22, 26, -14, 28, -8);
  // Má phúng phính phải (hamster cheek bump 1)
  ctx.bezierCurveTo(32, -4, 32, 2, 28, 6);
  // Má phúng phính phải (tuft 2)
  ctx.bezierCurveTo(26, 10, 20, 15, 12, 16);
  // Cằm tròn
  ctx.bezierCurveTo(6, 17, -6, 17, -12, 16);
  // Má phúng phính trái (tuft 2)
  ctx.bezierCurveTo(-20, 15, -26, 10, -28, 6);
  // Má phúng phính trái (tuft 1)
  ctx.bezierCurveTo(-32, 2, -32, -4, -28, -8);
  // Thái dương trái lên đỉnh đầu
  ctx.bezierCurveTo(-26, -14, -24, -22, -16, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Highlight sáng trên trán
  ctx.fillStyle = furHighlight;
  ctx.beginPath();
  ctx.ellipse(0, -18, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. VÙNG MÕM TRẮNG KEM & MŨI TRÁI TIM HỒNG (SNOUT & HEART NOSE)
  ctx.fillStyle = snoutColor;
  ctx.beginPath();
  ctx.ellipse(0, -5, 14, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mũi trái tim nhỏ màu hồng
  ctx.fillStyle = noseColor;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.bezierCurveTo(-3.5, -12.5, -5, -8, 0, -5.5);
  ctx.bezierCurveTo(5, -8, 3.5, -12.5, 0, -9);
  ctx.fill();

  // Rãnh nhân trung nhỏ
  ctx.strokeStyle = '#946648';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -5.5);
  ctx.lineTo(0, -3.5);
  ctx.stroke();

  // 6. HAI MÁ HỒNG TO TRÒN RỰC RỠ (BLUSH CHEEKS)
  ctx.save();
  ctx.fillStyle = blushColor;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(-18, -4, 6.8, 0, Math.PI * 2);
  ctx.arc(18, -4, 6.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 7. MIỆNG CƯỜI HỞ RĂNG (MOUTH & TEETH)
  if (isDropping || combo >= 2) {
    // Miệng mở to hớn hở reo hò khi thả hoặc khi combo cao
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-7, -3.5);
    ctx.quadraticCurveTo(0, 8, 7, -3.5);
    ctx.closePath();
    ctx.fillStyle = mouthInside;
    ctx.fill();
    ctx.strokeStyle = mouthDark;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Răng trắng nhỏ ở hàm trên
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.quadraticCurveTo(0, 1.5, 5, -3);
    ctx.lineTo(5, -3.5);
    ctx.lineTo(-5, -3.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (isOverflowing) {
    // Miệng lượn sóng lo lắng khi quá tải
    ctx.strokeStyle = mouthDark;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5, -2);
    ctx.quadraticCurveTo(-2.5, -4.5, 0, -2);
    ctx.quadraticCurveTo(2.5, 0.5, 5, -2);
    ctx.stroke();
  } else {
    // Miệng cười tươi hở răng đặc trưng như vaccination.png
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-6, -3.5);
    ctx.quadraticCurveTo(0, 5.5, 6, -3.5);
    ctx.closePath();
    ctx.fillStyle = mouthInside;
    ctx.fill();
    ctx.strokeStyle = mouthDark;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Thanh răng trắng hàm trên
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-4.5, -3);
    ctx.quadraticCurveTo(0, 0.8, 4.5, -3);
    ctx.lineTo(4.5, -3.5);
    ctx.lineTo(-4.5, -3.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 8. ĐÔI MẮT & CÁC TRẠNG THÁI BIỂU CẢM (EXPRESSIVE EYES)
  const isBlink = !isDropping && Math.sin(time * 0.0028) > 0.94;

  if (isDropping) {
    // Động tác thả: Mắt nhắm tít vui sướng reo vui (Joyful squint crescents ^  ^)
    ctx.strokeStyle = mouthDark;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    // Mắt trái
    ctx.beginPath();
    ctx.arc(-11, -12, 4.8, Math.PI * 0.9, Math.PI * 2.1, false);
    ctx.stroke();
    // Mắt phải
    ctx.beginPath();
    ctx.arc(11, -12, 4.8, Math.PI * 0.9, Math.PI * 2.1, false);
    ctx.stroke();
  } else if (combo >= 3) {
    // Mắt ngôi sao vàng rực rỡ khi combo cao!
    drawStar(ctx, -11, -11, 5, 2.5, '#F59E0B', '#B45309');
    drawStar(ctx, 11, -11, 5, 2.5, '#F59E0B', '#B45309');
  } else if (isOverflowing) {
    // Mắt tròn hoảng hốt + giọt mồ hôi run rẩy
    ctx.fillStyle = mouthDark;
    ctx.beginPath();
    ctx.arc(-11, -10, 3.2, 0, Math.PI * 2);
    ctx.arc(11, -10, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Giọt mồ hôi lo lắng bên trán
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22, -22);
    ctx.bezierCurveTo(25, -20, 27, -15, 24, -13);
    ctx.bezierCurveTo(21, -15, 20, -20, 22, -22);
    ctx.fill();
    ctx.stroke();
  } else if (isBlink) {
    // Chớp mắt tự nhiên
    ctx.strokeStyle = mouthDark;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-7, -10);
    ctx.moveTo(7, -10);
    ctx.lineTo(15, -10);
    ctx.stroke();
  } else {
    // Biểu cảm chuẩn của vaccination.png: Đôi mắt cong vòm vui vẻ mềm mại ^  ^
    ctx.strokeStyle = mouthDark;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-11, -11, 4.5, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(11, -11, 4.5, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.stroke();
  }
  ctx.restore(); // đóng transform head

  // 9. HAI BÀN TAY ÔM VÀ VUNG MỞ THẢ VẬT PHẨM (PAWS & RELEASE MOTION)
  const defaultHandLX = -14;
  const defaultHandRX = 14;
  const defaultHandY = 12 + recoilY;

  // Khi thả: hai bàn tay vung mở sang 2 bên và nâng nhẹ như buông tung vật xuống
  const handLX = defaultHandLX - pawOpenProgress * 12;
  const handRX = defaultHandRX + pawOpenProgress * 12;
  const handY = defaultHandY - pawOpenProgress * 6;

  const pawRadius = 6.5;
  ctx.fillStyle = furColor;
  ctx.strokeStyle = furOutline;
  ctx.lineWidth = 2.2;

  // Bàn tay trái
  ctx.save();
  ctx.translate(handLX, handY);
  ctx.rotate(-pawOpenProgress * 0.4);
  ctx.beginPath();
  ctx.arc(0, 0, pawRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Đệm thịt hồng nhỏ xíu ở lòng bàn tay khi mở ra
  if (pawOpenProgress > 0.3) {
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Bàn tay phải
  ctx.save();
  ctx.translate(handRX, handY);
  ctx.rotate(pawOpenProgress * 0.4);
  ctx.beginPath();
  ctx.arc(0, 0, pawRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Đệm thịt hồng nhỏ xíu ở lòng bàn tay khi mở ra
  if (pawOpenProgress > 0.3) {
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 10. HIỆU ỨNG TIA SÁNG LẤP LÁNH KHI BUÔNG TAY THẢ VẬT (RELEASE SPARKLES)
  if (isDropping && pawOpenProgress > 0.2) {
    ctx.save();
    const starAlpha = Math.sin(pawOpenProgress * Math.PI);
    ctx.globalAlpha = starAlpha;
    drawMiniSparkle(ctx, handLX - 8, handY - 4, 4.5, '#F59E0B');
    drawMiniSparkle(ctx, handRX + 8, handY - 4, 4.5, '#F59E0B');
    // Vòng sóng nhẹ
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 18, 12 + pawOpenProgress * 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 11. VẬT PHẨM Y TẾ ĐANG ĐƯỢC ÔM TRƯỚC NGỰC KHI CHƯA THẢ
  if (!isDropping) {
    const config = getItemConfigByLevel(currentLevel);
    const holdY = 22 + (config.height || config.radius * 2) * 0.42 * scaleFactor;
    // Cho vật cầm nghiêng nhẹ 8 độ tự nhiên và dao động nhẹ theo nhịp thở
    const swayAngle = Math.sin(time * 0.003) * 0.08 - 0.08;
    drawMedicalMascot(ctx, 0, holdY, currentLevel, swayAngle, 0.92 * scaleFactor, 'happy', time);
  }

  ctx.restore();
}

function drawNurseFace(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, dropping: boolean, worried: boolean, combo: number) {
  const eyeY = -25 + height * 0.386;
  const distance = width * 0.16;
  const mouthY = -25 + height * 0.505;
  const blink = Math.sin(time * 0.0035) > 0.965;
  ctx.save(); ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.strokeStyle = '#51362D';
  for (const sign of [-1,1]) {
    const eyeX = width * 0.007 + sign * distance;
    if (dropping || combo >= 3 || blink) {
      ctx.beginPath(); ctx.arc(eyeX, eyeY + 1, 2.8, Math.PI, 0); ctx.stroke();
    } else {
      ctx.fillStyle = '#583C2D'; ctx.beginPath(); ctx.ellipse(eyeX,eyeY,worried?2.5:2.8,worried?3.5:3.8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle = '#D9A45E';ctx.beginPath();ctx.ellipse(eyeX,eyeY+1.6,1.5,1,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle = '#FFFFFF';ctx.beginPath();ctx.arc(eyeX-0.8,eyeY-1.3,1.1,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle = 'rgba(251,113,133,.5)';ctx.beginPath();ctx.ellipse(eyeX+sign*1.8,eyeY+5.2,3.3,1.6,0,0,Math.PI*2);ctx.fill();
  }
  ctx.beginPath();
  if (worried) { ctx.moveTo(-2.6,mouthY); ctx.quadraticCurveTo(0,mouthY-2,2.6,mouthY);ctx.stroke(); }
  else {ctx.moveTo(-3.5,mouthY-1);ctx.quadraticCurveTo(0,mouthY+5,3.5,mouthY-1);ctx.closePath();ctx.fillStyle='#E9798C';ctx.fill();ctx.stroke();}
  ctx.restore();
}

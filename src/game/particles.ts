/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanvasParticle, FloatingText } from '../types/game';

// ========================================================
// HỆ THỐNG HIỆU ỨNG HẠT (PARTICLES) VÀ LẤP LÁNH (SPARKLES)
// Hiệu ứng nhẹ nhàng, êm dịu, lấp lánh cực kỳ thỏa mãn khi:
// - Hai vật phẩm y tế hợp nhất thành công (Merge Pop)
// - Tạo chuỗi combo liên hoàn (Combo Sparkles)
// - Dùng power-up Khử khuẩn (Bong bóng xà phòng)
// - Chữ nổi điểm số bật nảy sinh động (Pop Floating Text)
// Tự động thu hồi và dọn dẹp khi hết thời gian, không rò rỉ bộ nhớ.
// ========================================================

export class ParticleSystem {
  public particles: CanvasParticle[] = [];
  public floatingTexts: FloatingText[] = [];

  /**
   * Tạo chùm hiệu ứng hạt lấp lánh và vòng hào quang khi hai vật phẩm hợp nhất thành công
   * Kết hợp:
   * 1. Vòng sóng lan tỏa mềm mại (Shockwave Ring)
   * 2. Ngôi sao 4 cánh lấp lánh (Sparkling Stars)
   * 3. Trái tim nhỏ & Chữ thập y tế xinh xắn (Mini Hearts & Medical Crosses)
   * 4. Đốm sáng tròn phát sáng êm dịu (Soft Glowing Dots)
   */
  public emitMergeBurst(x: number, y: number, color: string, combo: number = 1) {
    const isHighCombo = combo >= 3;
    const baseCount = 14 + Math.min(combo * 3, 16);

    // 1. VÒNG SÓNG HÀO QUANG MỞ RỘNG (EXPANDING SHOCKWAVE RING)
    // Vòng 1: Màu chủ đạo của vật phẩm mới tạo
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 12,
      maxRadius: 42 + Math.min(combo * 5, 25),
      color: color,
      alpha: 0.85,
      decay: 0.038,
      shape: 'ring',
    });

    // Vòng 2: Màu trắng tinh khiết phát sáng nhẹ
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 8,
      maxRadius: 32 + Math.min(combo * 4, 18),
      color: '#FFFFFF',
      alpha: 0.7,
      decay: 0.045,
      shape: 'ring',
    });

    // 2. CÁC NGÔI SAO LẤP LÁNH (SPARKLING 4-POINT STARS)
    const starCount = 6 + Math.min(combo * 2, 8);
    const starColors = ['#FDE047', '#FEF08A', '#FFFFFF', color];
    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 * i) / starCount + (Math.random() - 0.5) * 0.5;
      const speed = 2.0 + Math.random() * 3.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        radius: 3.5 + Math.random() * 3.5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        alpha: 1.0,
        decay: 0.022 + Math.random() * 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        shape: 'sparkle',
      });
    }

    // 3. TRÁI TIM Y TẾ & CHỮ THẬP NHỎ XINH (MINI HEARTS & MEDICAL CROSSES)
    const medicalShapeCount = 4 + (isHighCombo ? 3 : 1);
    for (let i = 0; i < medicalShapeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.5;
      const isHeart = Math.random() > 0.45;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed * 0.8,
        vy: Math.sin(angle) * speed - 2.2, // Bay lơ lửng lên trên
        radius: 3.8 + Math.random() * 2.5,
        color: isHeart ? '#FB7185' : '#38BDF8', // Trái tim hồng san hô, chữ thập xanh pastel
        alpha: 0.95,
        decay: 0.018 + Math.random() * 0.012,
        rotation: (Math.random() - 0.5) * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        swaySpeed: 0.08 + Math.random() * 0.06,
        swayOffset: Math.random() * Math.PI * 2,
        shape: isHeart ? 'heart' : 'cross',
      });
    }

    // 4. CÁC ĐỐM SÁNG TRÒN PHÁT SÁNG MỀM MẠI (PASTEL GLOWING DOTS)
    for (let i = 0; i < baseCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        radius: 2.2 + Math.random() * 3.2,
        color: Math.random() > 0.35 ? color : '#FFFFFF',
        alpha: 0.95,
        decay: 0.026 + Math.random() * 0.018,
        shape: 'circle',
      });
    }
  }

  /**
   * Tạo chùm tia sáng vàng lấp lánh ăn mừng khi đạt Combo cao
   */
  public emitComboSparkles(x: number, y: number, combo: number) {
    const count = 12 + Math.min(combo * 3, 20);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 2.5 + Math.random() * 4.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        radius: 4.0 + Math.random() * 3.5,
        color: Math.random() > 0.5 ? '#F59E0B' : '#FDE047',
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        shape: 'sparkle',
      });
    }
  }

  /**
   * Tạo chùm bọt xà phòng / bong bóng sạch khuẩn khi dùng power-up Khử Khuẩn
   */
  public emitDisinfectBubbles(x: number, y: number, count: number = 22) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2, // Bay lên trên
        radius: 4.5 + Math.random() * 6.5,
        color: '#2DD4BF',
        alpha: 0.92,
        decay: 0.018 + Math.random() * 0.014,
        swaySpeed: 0.07 + Math.random() * 0.05,
        swayOffset: Math.random() * Math.PI * 2,
        shape: 'bubble',
      });
    }
  }

  /**
   * Thêm chữ nổi điểm số (+20, +50) hoặc combo (COMBO x3!) với hiệu ứng nảy bật phóng to
   */
  public addFloatingText(
    text: string,
    x: number,
    y: number,
    color: string = '#F59E0B',
    size: number = 22
  ) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x,
      y,
      color,
      size,
      alpha: 1.0,
      life: 0,
      maxLife: 48,
      scale: 0.6, // Bắt đầu nhỏ rồi phóng to bật nảy
    });
  }

  /**
   * Cập nhật chuyển động và xóa hạt đã mờ hết
   */
  public update() {
    // 1. Cập nhật hạt
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Nếu là vòng hào quang mở rộng (ring)
      if (p.shape === 'ring') {
        if (p.maxRadius && p.radius < p.maxRadius) {
          p.radius += (p.maxRadius - p.radius) * 0.14 + 1.2;
        }
        p.alpha -= p.decay;
        if (p.alpha <= 0.02) {
          this.particles.splice(i, 1);
        }
        continue;
      }

      // Các hạt bay thông thường
      p.x += p.vx;
      p.y += p.vy;

      // Dao động ngang mềm mại (Sway)
      if (p.swaySpeed !== undefined && p.swayOffset !== undefined) {
        p.swayOffset += p.swaySpeed;
        p.x += Math.sin(p.swayOffset) * 0.6;
      }

      // Giảm tốc độ từ từ và trọng lực êm ái
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.vy += p.shape === 'heart' || p.shape === 'cross' || p.shape === 'bubble' ? -0.04 : 0.06;

      p.alpha -= p.decay;
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed;
      }

      if (p.alpha <= 0.02) {
        this.particles.splice(i, 1);
      }
    }

    // 2. Cập nhật chữ nổi (Floating Text)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life++;
      ft.y -= 1.1; // Bay lơ lửng lên trên

      // Hiệu ứng nảy bật phóng to (Pop bounce: 0.6 -> 1.25 -> 1.0)
      if (ft.life <= 6) {
        ft.scale = 0.6 + (ft.life / 6) * 0.65; // Lên 1.25
      } else if (ft.life <= 12) {
        ft.scale = 1.25 - ((ft.life - 6) / 6) * 0.25; // Xuống 1.0
      } else {
        ft.scale = 1.0;
      }

      // Mờ dần về cuối
      if (ft.life > ft.maxLife * 0.55) {
        ft.alpha = Math.max(0, 1 - (ft.life - ft.maxLife * 0.55) / (ft.maxLife * 0.45));
      }
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Vẽ toàn bộ hạt và chữ nổi lên Canvas với chất lượng cao
   */
  public draw(ctx: CanvasRenderingContext2D) {
    // 1. VẼ CÁC HẠT PARTICLE
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      if (p.rotation) ctx.rotate(p.rotation);

      if (p.shape === 'ring') {
        // VÒNG HÀO QUANG MỞ RỘNG (EXPANDING SHOCKWAVE RING)
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1.8, p.radius * 0.06);
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Vòng mờ phụ bên trong
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(1.0, p.radius * 0.03);
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(2, p.radius - 2), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'sparkle') {
        // NGÔI SAO LẤP LÁNH 4 CÁNH ANIME
        const s = p.radius * 1.6;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.closePath();
        ctx.fill();

        // Lõi trung tâm phát sáng trắng lung linh
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'heart') {
        // TRÁI TIM Y TẾ NHỎ XINH
        const s = p.radius * 1.15;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.65);
        ctx.bezierCurveTo(-s * 1.15, s * 0.05, -s * 1.15, -s * 0.75, 0, -s * 0.25);
        ctx.bezierCurveTo(s * 1.15, -s * 0.75, s * 1.15, s * 0.05, 0, s * 0.65);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'cross') {
        // DẤU CHỮ THẬP Y TẾ NHỎ
        const s = p.radius * 1.2;
        const t = s * 0.36;
        ctx.fillStyle = p.color;
        ctx.fillRect(-t / 2, -s / 2, t, s);
        ctx.fillRect(-s / 2, -t / 2, s, t);
      } else if (p.shape === 'bubble') {
        // BONG BÓNG KHỬ KHUẨN
        ctx.fillStyle = 'rgba(204, 251, 241, 0.35)';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Điểm sáng bóng
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-p.radius * 0.35, -p.radius * 0.35, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // HẠT ĐỐM SÁNG TRÒN TIÊU CHUẨN
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Lõi trắng nếu hạt đủ lớn
        if (p.radius > 3.0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // 2. VẼ CHỮ NỔI (FLOATING TEXT) BẬT NẢY THỎA MÃN
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.translate(ft.x, ft.y);

      // Áp dụng scale bật nảy
      const scale = ft.scale || 1.0;
      ctx.scale(scale, scale);

      ctx.font = `900 ${ft.size}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Viền chữ trắng dày sắc nét
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(ft.text, 0, 0);

      // Đổ bóng màu mềm mại cho chữ
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}

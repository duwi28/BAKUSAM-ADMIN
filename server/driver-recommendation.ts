import { Driver, Order } from "@shared/schema";
import { storage } from "./storage";

// Interface untuk metrik performa driver
interface DriverPerformanceMetrics {
  driverId: number;
  completionRate: number; // Persentase order yang diselesaikan
  averageRating: number; // Rating rata-rata dari customer
  responseTime: number; // Waktu rata-rata merespons order (menit)
  onTimeDeliveryRate: number; // Persentase pengiriman tepat waktu
  totalOrdersCompleted: number; // Total order yang diselesaikan
  cancellationRate: number; // Persentase order yang dibatalkan
  customerComplaintRate: number; // Persentase komplain dari customer
  revenueGenerated: number; // Total revenue yang dihasilkan
  lastActiveDate: Date; // Terakhir kali aktif
  distanceFromPickup: number; // Jarak dari lokasi pickup (km)
  currentWorkload: number; // Jumlah order aktif saat ini
  priorityScore: number; // Skor prioritas driver
}

// Interface untuk rekomendasi driver
interface DriverRecommendation {
  driver: Driver;
  recommendationScore: number; // Skor rekomendasi (0-100)
  metrics: DriverPerformanceMetrics;
  reasons: string[]; // Alasan mengapa driver direkomendasikan
  estimatedDeliveryTime: number; // Estimasi waktu pengiriman (menit)
  confidenceLevel: 'Tinggi' | 'Sedang' | 'Rendah'; // Level kepercayaan rekomendasi
}

export class DriverRecommendationEngine {
  /**
   * Menghitung metrik performa driver berdasarkan data historis
   */
  static async calculateDriverMetrics(driverId: number): Promise<DriverPerformanceMetrics> {
    const driver = await storage.getDriver(driverId);
    const orders = await storage.getOrders();
    const complaints = await storage.getComplaints();
    
    if (!driver) {
      throw new Error(`Driver dengan ID ${driverId} tidak ditemukan`);
    }

    // Filter order berdasarkan driver
    const driverOrders = orders.filter(order => order.driverId === driverId);
    const completedOrders = driverOrders.filter(order => order.status === 'completed');
    const cancelledOrders = driverOrders.filter(order => order.status === 'cancelled');
    const driverComplaints = complaints.filter(complaint => complaint.driverId === driverId);

    // Hitung metrik performa
    const totalOrders = driverOrders.length;
    const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;
    
    // Hitung rating rata-rata (hanya dari order yang completed dan ada rating)
    const ratedOrders = completedOrders.filter(order => order.rating && order.rating > 0);
    const averageRating = ratedOrders.length > 0 
      ? ratedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / ratedOrders.length 
      : 0;

    // Simulasi metrik lainnya berdasarkan data yang ada
    const responseTime = this.calculateResponseTime(driver, driverOrders);
    const onTimeDeliveryRate = this.calculateOnTimeDeliveryRate(completedOrders);
    const cancellationRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;
    const customerComplaintRate = totalOrders > 0 ? (driverComplaints.length / totalOrders) * 100 : 0;
    
    // Hitung total revenue dari completed orders
    const revenueGenerated = completedOrders.reduce((total, order) => {
      return total + parseInt(order.totalFare.replace(/\D/g, ''));
    }, 0);

    return {
      driverId,
      completionRate,
      averageRating,
      responseTime,
      onTimeDeliveryRate: onTimeDeliveryRate,
      totalOrdersCompleted: completedOrders.length,
      cancellationRate,
      customerComplaintRate,
      revenueGenerated,
      lastActiveDate: new Date(), // Simulasi - dalam implementasi nyata ambil dari tracking
      distanceFromPickup: Math.random() * 10, // Simulasi jarak
      currentWorkload: Math.floor(Math.random() * 3), // Simulasi workload
      priorityScore: driver.priorityScore || 0
    };
  }

  /**
   * Menghitung waktu respons rata-rata driver (simulasi)
   */
  private static calculateResponseTime(driver: Driver, orders: any[]): number {
    // Simulasi berdasarkan rating dan prioritas driver
    const baseResponseTime = 15; // 15 menit baseline
    const ratingMultiplier = driver.rating ? (5 - parseFloat(driver.rating)) * 2 : 5;
    const priorityBonus = driver.priorityLevel === 'priority' ? -5 : 0;
    
    return Math.max(5, baseResponseTime + ratingMultiplier + priorityBonus);
  }

  /**
   * Menghitung tingkat pengiriman tepat waktu (simulasi)
   */
  private static calculateOnTimeDeliveryRate(completedOrders: any[]): number {
    if (completedOrders.length === 0) return 0;
    
    // Simulasi berdasarkan jumlah order - semakin berpengalaman semakin baik
    const experienceBonus = Math.min(completedOrders.length * 2, 20);
    const baseRate = 70 + experienceBonus;
    
    return Math.min(95, baseRate + Math.random() * 10);
  }

  /**
   * Memberikan rekomendasi driver terbaik untuk order tertentu
   */
  static async getDriverRecommendations(order: Order, maxRecommendations: number = 5): Promise<DriverRecommendation[]> {
    const drivers = await storage.getDrivers();
    const activeDrivers = drivers.filter(driver => driver.status === 'active');
    
    if (activeDrivers.length === 0) {
      return [];
    }

    // Hitung metrik dan skor untuk setiap driver
    const recommendations: DriverRecommendation[] = [];
    
    for (const driver of activeDrivers) {
      try {
        const metrics = await this.calculateDriverMetrics(driver.id);
        const recommendationScore = this.calculateRecommendationScore(metrics, order);
        const reasons = this.generateRecommendationReasons(metrics, driver);
        const estimatedDeliveryTime = this.estimateDeliveryTime(metrics, order);
        const confidenceLevel = this.determineConfidenceLevel(metrics);

        recommendations.push({
          driver,
          recommendationScore,
          metrics,
          reasons,
          estimatedDeliveryTime,
          confidenceLevel
        });
      } catch (error) {
        console.error(`Error calculating metrics for driver ${driver.id}:`, error);
      }
    }

    // Urutkan berdasarkan skor rekomendasi (tertinggi dulu)
    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    return recommendations.slice(0, maxRecommendations);
  }

  /**
   * Menghitung skor rekomendasi berdasarkan berbagai faktor
   */
  private static calculateRecommendationScore(metrics: DriverPerformanceMetrics, order: Order): number {
    let score = 0;

    // 1. Completion Rate (25% bobot)
    score += metrics.completionRate * 0.25;

    // 2. Average Rating (20% bobot)
    score += (metrics.averageRating / 5) * 100 * 0.20;

    // 3. Response Time (15% bobot) - semakin cepat semakin baik
    const responseScore = Math.max(0, 100 - (metrics.responseTime / 60) * 100);
    score += responseScore * 0.15;

    // 4. On Time Delivery Rate (15% bobot)
    score += metrics.onTimeDeliveryRate * 0.15;

    // 5. Low Cancellation Rate (10% bobot)
    const cancellationScore = Math.max(0, 100 - metrics.cancellationRate);
    score += cancellationScore * 0.10;

    // 6. Distance Proximity (10% bobot) - semakin dekat semakin baik
    const distanceScore = Math.max(0, 100 - (metrics.distanceFromPickup / 10) * 100);
    score += distanceScore * 0.10;

    // 7. Current Workload (5% bobot) - semakin sedikit semakin baik
    const workloadScore = Math.max(0, 100 - (metrics.currentWorkload / 5) * 100);
    score += workloadScore * 0.05;

    // Bonus untuk driver priority
    if (metrics.priorityScore > 80) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Menghasilkan alasan rekomendasi yang mudah dipahami
   */
  private static generateRecommendationReasons(metrics: DriverPerformanceMetrics, driver: Driver): string[] {
    const reasons: string[] = [];

    if (metrics.completionRate >= 90) {
      reasons.push(`Tingkat penyelesaian order sangat tinggi (${metrics.completionRate.toFixed(1)}%)`);
    }

    if (metrics.averageRating >= 4.5) {
      reasons.push(`Rating customer excellent (${metrics.averageRating.toFixed(1)}/5.0)`);
    }

    if (metrics.responseTime <= 10) {
      reasons.push(`Respon sangat cepat (${metrics.responseTime} menit)`);
    }

    if (metrics.onTimeDeliveryRate >= 85) {
      reasons.push(`Pengiriman tepat waktu (${metrics.onTimeDeliveryRate.toFixed(1)}%)`);
    }

    if (metrics.distanceFromPickup <= 2) {
      reasons.push(`Lokasi sangat dekat dengan pickup (${metrics.distanceFromPickup.toFixed(1)} km)`);
    }

    if (metrics.currentWorkload <= 1) {
      reasons.push('Workload rendah, dapat fokus pada order ini');
    }

    if (driver.priorityLevel === 'priority') {
      reasons.push('Driver priority dengan performa terbukti');
    }

    if (driver.vehicleType === 'motor' && metrics.totalOrdersCompleted >= 50) {
      reasons.push('Driver motor berpengalaman untuk pengiriman cepat');
    }

    if (reasons.length === 0) {
      reasons.push('Driver aktif dan tersedia untuk order');
    }

    return reasons.slice(0, 3); // Maksimal 3 alasan utama
  }

  /**
   * Estimasi waktu pengiriman berdasarkan performa driver
   */
  private static estimateDeliveryTime(metrics: DriverPerformanceMetrics, order: Order): number {
    // Base delivery time berdasarkan jarak (simulasi)
    const distance = parseFloat(order.distance);
    let baseTime = distance * 10; // 10 menit per km

    // Adjustment berdasarkan performa driver
    if (metrics.onTimeDeliveryRate >= 90) {
      baseTime *= 0.9; // 10% lebih cepat untuk driver punctual
    }

    if (metrics.responseTime <= 5) {
      baseTime *= 0.95; // 5% lebih cepat untuk driver responsif
    }

    if (metrics.currentWorkload >= 3) {
      baseTime *= 1.2; // 20% lebih lama jika workload tinggi
    }

    return Math.round(Math.max(15, baseTime)); // Minimum 15 menit
  }

  /**
   * Menentukan level kepercayaan rekomendasi
   */
  private static determineConfidenceLevel(metrics: DriverPerformanceMetrics): 'Tinggi' | 'Sedang' | 'Rendah' {
    if (metrics.totalOrdersCompleted >= 20 && metrics.averageRating >= 4.0) {
      return 'Tinggi';
    } else if (metrics.totalOrdersCompleted >= 5 && metrics.averageRating >= 3.5) {
      return 'Sedang';
    } else {
      return 'Rendah';
    }
  }

  /**
   * Memberikan insight dan analisis performa driver
   */
  static async getDriverPerformanceInsights(driverId: number): Promise<{
    metrics: DriverPerformanceMetrics;
    insights: string[];
    recommendations: string[];
    ranking: { position: number; totalDrivers: number; percentile: number };
  }> {
    const metrics = await this.calculateDriverMetrics(driverId);
    const allDrivers = await storage.getDrivers();
    const activeDrivers = allDrivers.filter(d => d.status === 'active');
    
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Generate insights berdasarkan metrik
    if (metrics.completionRate >= 95) {
      insights.push('Performa completion rate luar biasa!');
    } else if (metrics.completionRate <= 70) {
      insights.push('Completion rate perlu ditingkatkan');
      recommendations.push('Fokus pada komunikasi yang baik dengan customer');
    }

    if (metrics.averageRating >= 4.5) {
      insights.push('Rating customer sangat memuaskan');
    } else if (metrics.averageRating <= 3.5) {
      insights.push('Perlu perbaikan kualitas layanan');
      recommendations.push('Tingkatkan keramahan dan profesionalitas');
    }

    if (metrics.responseTime <= 5) {
      insights.push('Respon time excellent');
    } else if (metrics.responseTime >= 20) {
      insights.push('Respon time terlalu lambat');
      recommendations.push('Aktifkan notifikasi dan pantau aplikasi secara berkala');
    }

    // Hitung ranking driver
    const allMetrics = await Promise.all(
      activeDrivers.map(async (driver) => {
        try {
          const driverMetrics = await this.calculateDriverMetrics(driver.id);
          return { driverId: driver.id, score: this.calculateRecommendationScore(driverMetrics, {} as Order) };
        } catch {
          return { driverId: driver.id, score: 0 };
        }
      })
    );

    allMetrics.sort((a, b) => b.score - a.score);
    const position = allMetrics.findIndex(m => m.driverId === driverId) + 1;
    const percentile = ((activeDrivers.length - position + 1) / activeDrivers.length) * 100;

    return {
      metrics,
      insights,
      recommendations,
      ranking: {
        position,
        totalDrivers: activeDrivers.length,
        percentile: Math.round(percentile)
      }
    };
  }
}
import { OtpPurpose, OtpRole, PrismaClient } from '@prisma/client';

interface OtpKey {
  email: string;
  role: OtpRole;
  purpose: OtpPurpose;
}

export class OtpRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countSince(email: string, since: Date) {
    return this.prisma.otpVerification.count({ where: { email, createdAt: { gte: since } } });
  }

  async findLatestActive(key: OtpKey) {
    return this.prisma.otpVerification.findFirst({
      where: { ...key, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Issuing a new code retires any earlier unused codes for the same login.
  async replaceActive(
    key: OtpKey,
    data: { codeHash: string; expiresAt: Date; resendAvailableAt: Date },
  ) {
    const [, created] = await this.prisma.$transaction([
      this.prisma.otpVerification.updateMany({
        where: { ...key, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.otpVerification.create({ data: { ...key, ...data } }),
    ]);
    return created;
  }

  // Conditional updates keep attempt counting and one-time use safe under concurrent requests.
  async registerAttempt(id: string, maxAttempts: number) {
    const result = await this.prisma.otpVerification.updateMany({
      where: { id, consumedAt: null, attempts: { lt: maxAttempts } },
      data: { attempts: { increment: 1 } },
    });
    return result.count === 1;
  }

  async consume(id: string) {
    const result = await this.prisma.otpVerification.updateMany({
      where: { id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return result.count === 1;
  }

  async deleteById(id: string) {
    await this.prisma.otpVerification.delete({ where: { id } });
  }
}

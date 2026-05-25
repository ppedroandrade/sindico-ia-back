import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtUser } from '../auth/user-request.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeUser = {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        apartment: true,
        parkingSpaces: true,
      },
    },
  };

  create(data: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        type: data.type,
        referenceMonth: data.referenceMonth,
      },
      include: this.includeUser,
    });
  }

  async createBatch(data: {
    userIds?: string[];
    amount: number;
    dueDate: string;
    type: string;
    referenceMonth?: string;
  }) {
    const userIds =
      data.userIds?.length
        ? data.userIds
        : (
            await this.prisma.user.findMany({
              where: { role: 'morador', active: true },
              select: { id: true },
            })
          ).map((user) => user.id);

    await this.prisma.payment.createMany({
      data: userIds.map((userId) => ({
        userId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        type: data.type,
        referenceMonth: data.referenceMonth,
      })),
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'create_batch',
        entity: 'payment',
        metadata: { count: userIds.length, amount: data.amount, dueDate: data.dueDate, type: data.type },
      },
    });

    return this.prisma.payment.findMany({
      where: { userId: { in: userIds }, dueDate: new Date(data.dueDate), type: data.type },
      include: this.includeUser,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(user: JwtUser) {
    const where: Prisma.PaymentWhereInput = user.role === 'admin' ? {} : { userId: user.userId };
    return this.prisma.payment.findMany({
      where,
      include: this.includeUser,
      orderBy: { dueDate: 'desc' },
    });
  }

  async update(id: string, data: UpdatePaymentDto) {
    await this.findOneForAdmin(id);
    return this.prisma.payment.update({
      where: { id },
      data: {
        userId: data.userId,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
        status: data.status,
        type: data.type,
        referenceMonth: data.referenceMonth,
      },
      include: this.includeUser,
    });
  }

  async markPaid(id: string, user: JwtUser) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');
    if (user.role !== 'admin' && payment.userId !== user.userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'paid', paidDate: new Date() },
      include: this.includeUser,
    });
  }

  async generatePix(id: string, user: JwtUser) {
    const payment = await this.prisma.payment.findUnique({ where: { id }, include: this.includeUser });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');
    if (user.role !== 'admin' && payment.userId !== user.userId) throw new ForbiddenException('Acesso negado');

    return {
      paymentId: payment.id,
      amount: payment.amount,
      dueDate: payment.dueDate,
      pixCopyPaste: `PIX-SINDICOIA-${payment.id}-${payment.amount.toFixed(2)}`,
      note: 'Código Pix demonstrativo para testes locais. Integração bancária real fica para a etapa de gateway.',
    };
  }

  getReport(user: JwtUser) {
    const where: Prisma.PaymentWhereInput = user.role === 'admin' ? {} : { userId: user.userId };
    return this.prisma.payment.findMany({
      where,
      include: this.includeUser,
      orderBy: { dueDate: 'desc' },
    }).then((payments) => {
      const now = new Date();
      const summary = payments.reduce(
        (acc, payment) => {
          acc.total += payment.amount;
          if (payment.status === 'paid') acc.paid += payment.amount;
          else acc.pending += payment.amount;
          if (payment.status !== 'paid' && payment.dueDate < now) acc.overdue += payment.amount;
          return acc;
        },
        { total: 0, paid: 0, pending: 0, overdue: 0 },
      );

      const byMonth = payments.reduce<Record<string, { total: number; paid: number; pending: number }>>((acc, payment) => {
        const key = payment.referenceMonth ?? payment.dueDate.toISOString().slice(0, 7);
        acc[key] ??= { total: 0, paid: 0, pending: 0 };
        acc[key].total += payment.amount;
        if (payment.status === 'paid') acc[key].paid += payment.amount;
        else acc[key].pending += payment.amount;
        return acc;
      }, {});

      const defaulters = payments
        .filter((payment) => payment.status !== 'paid' && payment.dueDate < now)
        .map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          dueDate: payment.dueDate,
          user: payment.user,
        }));

      return { summary, byMonth, defaulters };
    });
  }

  async remove(id: string) {
    await this.findOneForAdmin(id);
    return this.prisma.payment.delete({ where: { id }, include: this.includeUser });
  }

  private async findOneForAdmin(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');
    return payment;
  }
}

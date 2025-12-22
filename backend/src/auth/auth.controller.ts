
import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  @Post('register')
  async register(@Body() body: any) {
    const userExists = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (userExists) {
        throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: `${body.firstName} ${body.lastName}`,
      },
    });
    return this.createToken(user);
  }

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new UnauthorizedException('User not found');
    
    const isValid = await bcrypt.compare(body.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    
    return this.createToken(user);
  }

  private createToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: true // Mocking email verify for MVP
      }
    };
  }
}

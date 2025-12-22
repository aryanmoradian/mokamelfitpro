
import { Controller, Post, Body, UseGuards, Request, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtService } from '@nestjs/jwt';

// Custom Guard implementation to extract User from JWT
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) return false;
    
    const token = authHeader.split(' ')[1];
    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload; // Inject payload (contains sub/userId) into request
      return true;
    } catch {
      return false;
    }
  }
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-formula')
  async generateFormula(@Request() req, @Body() quizData: any) {
    // req.user.sub is the userId from the JWT
    return this.aiService.generateFormula(req.user.sub, quizData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Body() body: { history: any[], message: string, useThinking: boolean, useSearch: boolean }) {
    return this.aiService.chat(body.history, body.message, body.useThinking, body.useSearch);
  }

  @UseGuards(JwtAuthGuard)
  @Post('analyze-image')
  async analyzeImage(@Request() req, @Body() body: { currentFormulaId: string, image: string, mimeType: string }) {
    return this.aiService.analyzeImage(req.user.sub, body.currentFormulaId, body.image, body.mimeType);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tts')
  async textToSpeech(@Body() body: { text: string }) {
    return this.aiService.textToSpeech(body.text);
  }
}

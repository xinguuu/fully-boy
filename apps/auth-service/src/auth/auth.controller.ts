import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  SignupDto,
  SignupDtoSchema,
  LoginDto,
  LoginDtoSchema,
  RefreshTokenDto,
  RefreshTokenDtoSchema,
  AuthResponse,
  UserResponse,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(SignupDtoSchema))
  async signup(@Body() dto: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginDtoSchema))
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(RefreshTokenDtoSchema))
  async logout(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: RefreshTokenDto,
  ): Promise<void> {
    return this.authService.logout(user.id, dto.refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(RefreshTokenDtoSchema))
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: CurrentUserData): Promise<UserResponse> {
    return this.authService.getCurrentUser(user.id);
  }
}

import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './auth.guard';
import { PinoLogger } from 'pino-nestjs';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly logger: PinoLogger,
        private readonly authService: AuthService
    ) {}

    @Post('login')
    @ApiOperation({ summary: 'Realizar login', description: 'Autentica um usuário e retorna tokens de acesso' })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Post('register')
    @ApiOperation({ summary: 'Registrar novo usuário', description: 'Cria uma nova conta de usuário no sistema' })
    @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou usuário já existe' })
    async register(@Body() registerUserDto: RegisterUserDto) {
        return  this.authService.register(registerUserDto);
    }

    @UseGuards(AuthGuard)
    @Get('users')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Listar todos os usuários', description: 'Retorna uma lista de todos os usuários cadastrados' })
    @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    async findAll() {
        return this.authService.findAll();
    }

    @UseGuards(AuthGuard)
    @Put('users')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Atualizar usuário', description: 'Atualiza os dados de um usuário existente' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async update(@Body() updateUserDto: UpdateUserDto) {
        return this.authService.update(updateUserDto);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Atualizar token de acesso', description: 'Atualiza o token de acesso usando um token de refresh' })
    @ApiResponse({ status: 200, description: 'Token de acesso atualizado com sucesso' })
    @ApiResponse({ status: 401, description: 'Token de refresh inválido' })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
}

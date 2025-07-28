import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";
export {
  LoginDto,
  LoginMethod,
  RegisterDto,
  CaptchaDts,
  LoginDts,
  CreateRoleDto,
  PerfectInfo,
};
enum LoginMethod {
  ACCOUNT = "account",
  PHONE = "phone",
  EMAIL = "email",
}

interface Captcha {
  id: string;
  code: string;
}

class LoginDto implements Captcha {
  @ValidateIf((o) => o.method === LoginMethod.ACCOUNT)
  @ValidateIf((o) => o.method === LoginMethod.PHONE)
  @ValidateIf((o) => o.method === LoginMethod.EMAIL)
  @IsNotEmpty({ message: "缺少参数" })
  account: string;

  @IsNotEmpty({ message: "缺少参数" })
  @Min(6, { message: "密码至少6位" })
  password: string;
  @IsNotEmpty({ message: "缺少参数" })
  id: string;
  @IsNotEmpty({ message: "缺少参数" })
  code: string;

  @IsEnum(LoginMethod)
  @IsNotEmpty({ message: "缺少参数" })
  method: LoginMethod;
}
interface LoginDto extends Captcha {
  account: string;
  password: string;
  method: LoginMethod;
}
interface RegisterDto extends Captcha {
  account: string;
  password: string;
}
interface PerfectInfo {
  account?: string;
  phone?: string;
  email?: string;
  userName?: string;
  idCard?: string;
  nickName?: string;
}
interface CaptchaDts {
  id: string;
  base64: string;
}
interface LoginDts {
  token: string;
  etime: number;
}

interface CreateRoleDto {
  name: string;
  description: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString({ message: "是字符类型" })
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;

  @IsString({ message: "是字符类型" })
  @IsNotEmpty({ message: "确认密码不能为空" })
  confirmPassword: string;
}

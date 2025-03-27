export class User {
  id!: number;
  name!: string;
  email!: string;
}

export class CreateUserDto {
  name!: string;
  email!: string;
}

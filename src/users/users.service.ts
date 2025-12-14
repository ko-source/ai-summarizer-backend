import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    delete (user as unknown as { password?: string })?.password;
    return user;
  }

  async create(
    email: string,
    hashedPassword: string,
    username: string,
  ): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      username,
    });
    return this.usersRepository.save(user);
  }
}

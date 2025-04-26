import { User } from 'src/users/entities/user.entity';
import { ChildEntity } from 'typeorm';

@ChildEntity('admin')
export class AdminUser extends User {}

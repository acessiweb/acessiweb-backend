import { User } from 'src/common/user.entity';
import { ChildEntity } from 'typeorm';

@ChildEntity('admin')
export class AdminUser extends User {}

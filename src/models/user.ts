import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces';

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: Buffer,
  salt: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true
  }
});

const User = model('User', UserSchema);

export default User;
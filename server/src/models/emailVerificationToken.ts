import { Model, model, ObjectId, Schema } from 'mongoose';

interface EmailVerificationTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

const emailVerificationTOkenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      expires: 3600,
      default: Date.now(),
    },
  }
);

export default model(
  'EmailVerificationToken',
  emailVerificationTOkenSchema
) as Model<EmailVerificationTokenDocument>;

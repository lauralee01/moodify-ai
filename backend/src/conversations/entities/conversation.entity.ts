import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * One chat "thread". Belongs to a session (sessionId).
 * Messages are stored in the messages table and linked by conversationId.
 */
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  sessionId!: string;

  @Column({ type: 'varchar', length: 500, default: 'New chat' })
  title!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

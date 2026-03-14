import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

/** Role of the message sender: user or assistant. */
export type MessageRole = 'user' | 'assistant';

/**
 * One message in a conversation. Either from the user (text only)
 * or from the assistant (text + optional tracks array).
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  conversationId!: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @Column({ type: 'varchar', length: 20 })
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  /**
   * For assistant messages: optional array of track objects (id, name, artistNames, etc.).
   * Stored as JSON in the database.
   */
  @Column({ type: 'jsonb', nullable: true })
  tracks!: unknown[] | null;

  @CreateDateColumn()
  createdAt!: Date;
}

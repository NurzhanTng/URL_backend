import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UrlLogCreationAttrs {
  shortUrl: string;
  ip: string;
}

@Table({ tableName: 'url_logs' })
export class UrlLog extends Model<UrlLog, UrlLogCreationAttrs> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  shortUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ip: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;
}

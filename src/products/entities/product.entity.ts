import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./proctuct-image.entity";

@Entity()
export class Product {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text", { unique: true })
  title: string;

  @Column("float", { default: 0 })
  price: number;

  @Column("text", { nullable: true })
  description: string;

  @Column("text", { unique: true })
  slug: string;

  @Column("int", { default: 0 })
  stock: number

  @Column("text", { array: true })
  sizes: string[];

  @Column("text")
  gender: string;

  @Column("text", { array: true, default: [] })
  tags: string[]

  @OneToMany(
    () => ProductImage,
    productImage => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @BeforeInsert() // Este decorador nos permite ejecutar una función antes de insertar un registro en la base de datos
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title
    }

    this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
  }

  @BeforeUpdate() // Este decorador nos permite ejecutar una función antes de actualizar un registro en la base de datos
  checkSlugUpdate() {

    if (!this.slug) {
      this.slug = this.title
    }

    this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
  }
}

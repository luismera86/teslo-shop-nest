import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @BeforeInsert() // Este decorador nos permite ejecutar una función antes de insertar un registro en la base de datos
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title
    }

    this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
  }

  // @BeforeUpdate() // Este decorador nos permite ejecutar una función antes de actualizar un registro en la base de datos
  // checkSlugUpdate() {
  //   if (!this.slug) {
  //     this.slug = this.title
  //   }

  //   this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
  // }
}

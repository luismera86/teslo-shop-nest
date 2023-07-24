import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) { }
  async create(createProductDto: CreateProductDto) {
    try {

      const product = this.productsRepository.create(createProductDto);
      await this.productsRepository.save(product);
      return product;

    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productsRepository.find({ take: limit, skip: offset }); // take y skip son métodos de TypeORM para paginar los resultados
    // take: limit -> limita la cantidad de resultados que se van a mostrar
    // skip: offset -> se salta la cantidad de resultados que se le indique
  }

  async findOne(term: string) {
    let product: Product;

    // Modelo sin QueryBuilder
    // if (isUUID(term)) {
    //   product = await this.productsRepository.findOneBy({ id: term }); // Si el término es un UUID válido, buscamos el producto por id
    // } else {
    //   product = await this.productsRepository.findOneBy({ slug: term }); // Si el término no es un UUID válido, buscamos el producto por slug
    // }

    // QueryBuilder
    if (isUUID(term)) {
      product = await this.productsRepository.findOneBy({ id: term }); // Si el término es un UUID válido, buscamos el producto por id
    } else {
      const queryBuilder = this.productsRepository.createQueryBuilder();
      product = await queryBuilder.where("UPPER(title) =:title or slug =:slug", { // Con el UPPER() convertimos el título a mayúsculas para que la búsqueda sea case insensitive 
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      }).getOne()
    }
    // Descripción de lo que realiza 
    // product = await queryBuilder.where("title =:title or slug =:slug", { // title =:title or slug =:slug -> title y slug son los nombres de las columnas en la base de datos
    //   title: term, // title: term -> title es el nombre de la columna en la base de datos y term es el valor que se va a buscar
    //   slug: term // slug: term -> slug es el nombre de la columna en la base de datos y term es el valor que se va a buscar
    // }).getOne() // getOne() -> nos devuelve un solo registro


    if (!product) throw new NotFoundException(`Product with ${term} not found`);
    return product;

  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    // Una forma de hacerlo
    // const product = await this.findOne(id); // Buscamos el producto por id para verificar que exista en la base de datos
    // try {

    //   this.productsRepository.merge(product, updateProductDto); // Mergeamos el producto con los datos que vienen en el DTO
    //   return await this.productsRepository.save(product);
    // } catch (error) {
    //   this.handleDBException(error)
    // }

    // Otra forma de hacerlo
    const product = await this.productsRepository.preload({
      id: id,
      ...updateProductDto
    })

    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productsRepository.save(product);
      return product;

    } catch (error) {
      this.handleDBException(error)
    }


  }

  async remove(id: string) {

    const product = await this.findOne(id);
    await this.productsRepository.remove(product);

    return { message: `Product with id ${id} deleted successfully` };

  }

  // Generamos un método privado para manejar las excepciones de la base de datos y poder mostrar del lado del cliente un mensaje más amigable
  private handleDBException(error: any) {

    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}

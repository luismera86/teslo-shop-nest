import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import e from 'express';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

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

  async findOne(id: string) {

    const product = await this.productsRepository.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);
    return product;

  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.findOne(id); // Buscamos el producto por id para verificar que exista en la base de datos
    this.productsRepository.merge(product, updateProductDto); // Mergeamos el producto con los datos que vienen en el DTO
    return await this.productsRepository.save(product);

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

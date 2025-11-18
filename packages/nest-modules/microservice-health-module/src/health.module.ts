import { DynamicModule, InjectionToken, Module, ModuleMetadata, Provider } from "@nestjs/common";
import {
  DiskHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { HttpHealthController } from "./health/http-health.controller.js";
import { HealthService } from "./health/health.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RmqHealthController } from "./health/rmq-health.controller.js";
import { RMQ_HEALTH_OPTIONS } from "./injection-token.js";
import checkDiskSpace from "check-disk-space";

@Module({})
export class MicroserviceHealthModule {
  static registerAsync(options: {
    imports?: ModuleMetadata["imports"];
    inject?: ModuleMetadata["providers"];
    useFactory: (...args: any[]) => {
      rmqUrls: string[];
      includeDb?: boolean;
    };
  }): DynamicModule {


    return {
      module: MicroserviceHealthModule,
      imports: [
        TerminusModule,
        ...(options.imports ?? []),
        {
          module: class {},
          imports: [],
          providers: [],
        },
      ],
      controllers: [HttpHealthController, RmqHealthController],
      providers: [
        {
          provide: RMQ_HEALTH_OPTIONS,
          useFactory: (...args) => {
            const { rmqUrls } = options.useFactory(...args);
            return rmqUrls;
          },
          inject: options.inject as InjectionToken[] ?? [],
        },

        HealthService,
        MicroserviceHealthIndicator,
        MemoryHealthIndicator,
        DiskHealthIndicator,
        {
          provide: 'CheckDiskSpaceLib',
          useValue: checkDiskSpace
        },
        {
          provide: TypeOrmHealthIndicator,
          useFactory: (...args) => {
            const { includeDb } = options.useFactory(...args);
            if (!includeDb) return undefined; 
          },
          inject: options.inject as InjectionToken[] ?? [],
        },
      ],
      exports: [HealthService],
    };
  }

  static register(
    rmqUrls: string[],
    includeDb?: boolean,
  ): DynamicModule {
    const imports: any[] = [TerminusModule];
    const providers: Provider[] = [
      HealthService,
      MicroserviceHealthIndicator,
      MemoryHealthIndicator,
      DiskHealthIndicator,
      {
        provide: RMQ_HEALTH_OPTIONS,
        useValue: rmqUrls,
      },
    ];

    if (includeDb) {
      imports.push(TypeOrmModule.forFeature([]));
      providers.push(TypeOrmHealthIndicator); // ⬅️ NO new, Nest lo crea
    }

    return {
      module: MicroserviceHealthModule,
      imports,
      controllers: [HttpHealthController, RmqHealthController],
      providers,
      exports: [HealthService],
    };
  }
}
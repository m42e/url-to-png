import * as S3 from "aws-sdk/clients/s3";
import { GetObjectRequest, PutObjectRequest } from "aws-sdk/clients/s3";
import { IImageStorage } from "../services/image-storage.service";
import { LoggerService } from "../services/logger.service";

export class AmazonS3StorageProvider implements IImageStorage {
  constructor(private readonly s3: S3, private readonly logger: LoggerService, private readonly BUCKET_NAME: string) {

    this.logger.debug(`s3 initialized`);
  }

  public async fetchImage(imageId: string) {
    const params: GetObjectRequest = { Bucket: this.BUCKET_NAME, Key: this.getImageId(imageId) };
    try {
      const response = await this.s3.getObject(params).promise();
      return response.Body;
    } catch {
      return null;
    }
  }

  public async storeImage(imageId: string, image: Buffer) {
    try {
      this.logger.debug(`save to s3 ${imageId}`);
      const _self = this;
      const data: PutObjectRequest = {
        Key: this.getImageId(imageId),
        Body: image,
        Bucket: this.BUCKET_NAME,
      };
      await this.s3.putObject(data,
        function(err, data) {
           if (err)
             _self.logger.debug(err + JSON.stringify(err.stack)); // an error occurred
           else
             _self.logger.debug(JSON.stringify(data));           // successful response
         }
      ).promise();
      return true;
    } catch (err) {
      return false;
    }
  }

  private getImageId(imageId: string) {
    return imageId + ".png";
  }
}

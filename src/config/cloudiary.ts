import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import { FOLDER_UPLOAD } from "~/shared/constraint";
import { BadRequestException } from "~/shared/utils/error-exception";

export class CloudiaryService {
  private static instance?: CloudiaryService;
  private initialized = false;

  private constructor() {
    this.initConfig();
  }

  static getInstance(): CloudiaryService {
    if (!CloudiaryService.instance) {
      CloudiaryService.instance = new CloudiaryService();
    }
    return CloudiaryService.instance;
  }

  private initConfig(): void {
    if (this.initialized) return;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    this.initialized = true;
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    try {
      const defaultOptions: UploadApiOptions = {
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        folder: FOLDER_UPLOAD.POSTS,
        use_asset_folder_as_public_id_prefix: true,
        asset_folder: "posts",
      };

      const mergedOptions = { ...defaultOptions, ...options };

      const base64 = Buffer.from(file.buffer).toString("base64");

      const URI = "data:" + file.mimetype + ";base64," + base64;

      const result = await cloudinary.uploader.upload(URI, mergedOptions);

      return result;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new BadRequestException("Failed to upload file to Cloudinary");
    }
  }

  getAssetInfo = async (publicId?: string): Promise<string | undefined> => {
    if (!publicId) return undefined;
    const options = {
      colors: true,
    };

    try {
      const result = await cloudinary.api.resource(publicId, options);
      console.log(result);
      return result.colors;
    } catch (error) {
      console.error(error);
    }
  };

  async deleteImage() {}

  getCloudinary() {
    return cloudinary;
  }
}

export default CloudiaryService.getInstance();

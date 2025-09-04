import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads', // folder where files will be saved
    filename: (req, file, callback) => {
      // create a unique filename
      const name = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `${name}-${uniqueSuffix}${fileExtName}`);
    },
  }),
};
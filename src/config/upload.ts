import multer from 'multer';
import path from 'path';

const folder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  folderUpload: folder,
  storage: multer.diskStorage({
    destination: folder,
    filename: (req, file, callback) => {
      return callback(null, file.originalname);
    },
  }),
};

function manageImg(file) {
  file = file.replace(/\s/g, '');
  const fileExt = file.split('.');
  const extension = fileExt[fileExt.length - 1];
  if (extension === 'jpg' || extension === 'png' || extension === 'jpeg') {
    const date = new Date().getTime();
    const fileToUpload = `${fileExt[0]}-${hat()}-${date}.${extension}`;
    return fileToUpload;
  }
}
module.exports = {
  manageImg
};

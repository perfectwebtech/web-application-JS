const hat = require('hat');
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
function handleError(status, req, res) {
  if (status === 400 || status === 404) {
    return res
      .status(status)
      .json({ ok: false, message: 'Object could not be found' });
  }
  if (status === 500) {
    return res.status(status).json({ ok: false, message: 'Internal error' });
  }
}
function manageResponse(status, message, req, res) {
  if (status === 200) {
    return res.status(status).json({ ok: true, message });
  }
}

module.exports = {
  manageImg,
  handleError,
  manageResponse
};

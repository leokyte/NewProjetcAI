export function calcDim(imageWidth, imageHeight, maxHeight, maxWidth) {
    const imageRatio = imageWidth / imageHeight;

    let newImageHeight = Math.min(maxHeight, imageHeight);
    let newImageWidth 	= newImageHeight * imageRatio;

    if (maxWidth > 0 && newImageWidth > maxWidth) {
        newImageWidth = maxWidth;
        newImageHeight = maxWidth / imageRatio;
    }

    return {
        imageWidth: newImageWidth,
        imageHeight: newImageHeight,
    };
}


export const textSizeFill = (length) => {
  return 66 - (length > 6 ? length * 2.5 : length);
};

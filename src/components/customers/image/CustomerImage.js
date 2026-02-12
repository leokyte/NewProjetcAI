import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { KyteIcon } from '../../common';
import { fileExists, getImageUrl, localFileExist, getImagePath } from '../../../util';

class CustomerImage extends Component {
  constructor(props) {
    super(props);
    const { customer } = this.props;
    const isExternalImage = customer.image.startsWith('http');

    this.state = {
      imageExist: customer.image,
      doCheckImage: true,
      imageUrl: isExternalImage ? customer.image : getImageUrl(customer),
      localImage: '',
      retries: 0,
      refresh: false
    };
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutHandler);
  }

  onError() {
   const { customer } = this.props;
   const localImgPath = getImagePath(customer.image);

   localFileExist(localImgPath).then((exist) => {
     if (exist) {
       this.setState({ localImage: localImgPath });
     } else {
       this.resetImage();
       this.checkImage();
     }
   });
 }

  checkImage() {
    const { doCheckImage, retries } = this.state;
    const { customer } = this.props;
    const newImage = getImageUrl(customer);

    if (doCheckImage) {
      fileExists(newImage, () => {
        this.setState({ imageExist: true, imageUrl: newImage });
      }, () => {
        if (retries === 3) return;
        this.resetImage();
        this.setState({ retries: (retries + 1) });
        this.reCheckImage();
      });
    }
  }

  reCheckImage() {
    this.timeoutHandler = setTimeout(() => {
      this.checkImage();
    }, 7000);
  }

  resetImage() {
    this.setState({
      imageUrl: '',
      localImage: '',
      imageExist: false
    });
  }

  renderIcon() {
    const { iconContainer } = styles;
    return (
      <View style={iconContainer}>
        <KyteIcon name='load' size={38} color={'#FFFFFF'} />
      </View>
    );
  }

  renderImage() {
    const { imageUrl, localImage } = this.state;
    const { style } = this.props;

    return (
      <FastImage
        style={style}
        source={{ uri: localImage || imageUrl }}
        onError={() => this.onError()}
      />
    );
  }

  render() {
    const { imageExist } = this.state;
    return imageExist ? this.renderImage() : this.renderIcon();
  }
}

const styles = {
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e3e6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  }
};

const mapStateToProps = ({ sync }) => ({ updatedDocument: sync.syncDownResult.syncUpdatedDocument });

export default connect(mapStateToProps)(CustomerImage);

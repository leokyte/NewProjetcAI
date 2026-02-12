import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { colors, Type } from '../../styles';
import { KyteButton, KyteSafeAreaView } from '../common';
import { OnboardingCarousel as carouselData } from '../../enums';
import I18n from '../../i18n/i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class OnboardingCarousel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSlide: 0,
    };
  }

  renderBottomPage() {
    const { navigate } = this.props.navigation;

    return (
      <View style={style.bottomPageMainView}>
        <View style={{ alignItems: 'center', marginBottom: 25 }}>
          <TouchableOpacity onPress={() => navigate({ key: 'LoginPage', name: 'Login' })}>
            <Text style={[Type.Medium, { color: colors.actionColor, fontSize: 18 }]}>{I18n.t('words.s.skip')}</Text>
          </TouchableOpacity>
        </View>
        <KyteButton
          background={colors.actionColor}
          height={55}
          onPress={() => navigate({ key: 'LoginPage', name: 'Login' })}
        >
          <Text style={[Type.Medium, { color: 'white', fontSize: 18 }]}>{I18n.t('onboarding.signUpFree')}</Text>
        </KyteButton>
      </View>
    );
  }

  renderItem({ item }) {
    return (
      <View style={style.itemView}>
        <View>
          <Text style={style.itemTitle}>{item.title}</Text>
          <Text style={style.itemTitle}>{item.title2}</Text>
        </View>
        <View>
          <Image
            source={{ uri: item.image }}
            style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.71 }}
            resizeMode={'contain'}
          />
        </View>
        <View>
          <Text style={style.itemSubtitle}>{item.subtitle}</Text>
          <Text style={style.itemSubtitle}>{item.subtitle2}</Text>
        </View>
      </View>
    );
  }

  renderCarousel() {
    const { activeSlide } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <Carousel
          data={carouselData}
          renderItem={this.renderItem}
          onSnapToItem={(index) => this.setState({ activeSlide: index })}
          sliderWidth={SCREEN_WIDTH}
          itemWidth={SCREEN_WIDTH}
          lockScrollWhileSnapping
        />
        <Pagination
          dotsLength={carouselData.length}
          activeDotIndex={activeSlide}
          dotStyle={style.dotStyle('white')}
          inactiveDotStyle={style.dotStyle(colors.primaryBg)}
          inactiveDotScale={1}
        />
      </View>
    );
  }

  render() {
    return (
      <KyteSafeAreaView style={style.mainView}>
        <View style={style.mainContentView}>{this.renderCarousel()}</View>
        {this.renderBottomPage()}
      </KyteSafeAreaView>
    );
  }
}

const style = {
  mainView: {
    flex: 1,
    backgroundColor: colors.secondaryBg
  },
  mainContentView: {
    flex: 1,
  },
  itemView: {
    flex: 1,
    // backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SCREEN_HEIGHT * 0.06,
  },
  itemTitle: [Type.SemiBold, { color: 'white', fontSize: 24, lineHeight: 32, textAlign: 'center' }],
  itemSubtitle: { color: 'white', textAlign: 'center', fontSize: 16, lineHeight: 20 },
  dotStyle: (backgroundColor = 'white') => ({
    width: 7,
    height: 7,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor,
  }),
  bottomPageMainView: {
    paddingHorizontal: 13,
    paddingBottom: 13,
  },
};

export default OnboardingCarousel;

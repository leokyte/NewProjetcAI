import { renderSocialMediaIntegrationTip } from '../SocialMediaIntegration';

export const renderTip = (showTip, setShowTip, tipIndex, isIntegrated) => {
	const hideModal = () => setShowTip(false);
	const p = {
		isModalVisible: showTip,
		hideModal,
		goToIntegration: hideModal,
		tipIndex,
		isIntegrated,
	};

	return renderSocialMediaIntegrationTip(p);
};

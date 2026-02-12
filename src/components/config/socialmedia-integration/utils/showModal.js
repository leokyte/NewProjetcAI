const showModal = (title, description, typeEvent, setContentModal, setIsModalVisible) => {
	setContentModal({
		title,
		description,
		typeEvent,
	});
	setIsModalVisible(true);
};

export default showModal;

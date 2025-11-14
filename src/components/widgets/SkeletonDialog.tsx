import styled, { keyframes } from 'styled-components';

// Animazione per il caricamento
const loadingAnimation = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

// Stile del contenitore del dialog
const DialogContainer = styled.div`
	width: 100%;
	background-color: #090B38;
	display: flex;
	flex-direction: column;
    grid-gap: 20px;
`;

// Stile delle linee scheletro
const SkeletonLine = styled.div`
	height: 12px;
	background: transparent;
	background-size: 200% 100%;
	animation: ${loadingAnimation} 1.5s infinite;
	border-radius: 4px;

	&.short {
		width: 30%;
	}

	&.long {
		width: 100%;
	}
`;

const SkeletonDialog = () => {
	return (
		<DialogContainer>
			<SkeletonLine className='short' />
			<SkeletonLine className='long' />
		</DialogContainer>
	);
};

export default SkeletonDialog;

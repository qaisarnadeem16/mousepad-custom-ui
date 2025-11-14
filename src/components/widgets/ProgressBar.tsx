import { useZakeke } from '@zakeke/zakeke-configurator-react';
import { T } from 'Helpers';
import { FC } from 'react';
import styled from 'styled-components';
import { ReactComponent as CheckSolid } from '../../assets/icons/check-circle-solid_1.svg';
import { Icon } from 'components/Atomic';
import useStore from 'Store';

/* IMPORT LOGO */
import LogoImg from '../../assets/images/logo.avif';

/* WRAPPER WITH GLOW + GLASS BACKGROUND */
const ProgressWrapper = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 9999;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	background: rgba(12, 15, 43, 0.55); /* dark transparent theme background */
	backdrop-filter: blur(12px);        /* glassy blur */
	padding: 22px 30px;
	border-radius: 22px;

	/* Purple glow theme shadow */
	box-shadow: 0px 8px 40px rgba(102, 51, 255, 0.55);
`;


const Logo = styled.img`
	width: 110px;
	height: auto;
	margin-bottom: 14px;
`;

const LoadingLabel = styled.div`
	color: #fff;
	font-size: 14px;
	font-style: normal;
	font-weight: 600;
	line-height: 18px;
	margin-bottom: 12px;
`;

const LoaderContainer = styled.div<{ $isMobile: boolean }>`
	height: 10px;
	width: ${(props) => (props.$isMobile ? `260px` : `600px`)};
	border-radius: 8px;
	background-color: #0c0f2b; /* dark UI-like panel */
	overflow: hidden;

	/* Soft purple glow - same style as toolbar */
	box-shadow: 0 4px 25px rgba(102, 51, 255, 0.45);
`;

const LoadingPercentageLabel = styled.span`
	color: #fff;
	font-weight: 400;
	font-size: 12px;
	line-height: 16px;
	font-style: normal;
`;

const LoadingPercentageandIconContainer = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 8px;
	width: 100%;
`;

const CheckIcon = styled(Icon)`
	cursor: unset;
	color: #00c285;
`;

const LoaderFill = styled.div<{ $completed: number }>`
	height: 100%;
	width: ${(props) => props.$completed}%;
	background-color: #6633FF;
	border-radius: 8px;
	transition: width 0.35s ease;
`;

const ProgressBar: FC<{ $flagStartLoading: boolean; $bgColor: string; $completed: number }> = ({
	$flagStartLoading,
	$bgColor,
	$completed
}) => {
	const { isSceneLoading } = useZakeke();
	const { isMobile } = useStore();

	const calculatedValue = !isSceneLoading && $flagStartLoading ? 100 : $completed;

	return (
		<ProgressWrapper>
			<Logo src={LogoImg} alt="Brand Logo" />
			<LoadingLabel>
				{isSceneLoading
					? T._d('Loading your product...')
						? T._d('Loading your product...')
						: T._('Loading your product...', 'Composer')
					: T._d('Loading complete.')
					? T._d('Loading complete.')
					: T._('Loading complete.', 'Composer')}
			</LoadingLabel>

			<LoaderContainer $isMobile={isMobile}>
				<LoaderFill $completed={calculatedValue} />
			</LoaderContainer>

			<LoadingPercentageandIconContainer>
				<LoadingPercentageLabel>
					{isSceneLoading
						? (T._d('In progress | ') ? T._d('In progress | ') : T._('In progress | ', 'Composer')) +
						  `${$completed}%`
						: '100%'}
				</LoadingPercentageLabel>

				{!isSceneLoading && (
					<CheckIcon>
						<CheckSolid />
					</CheckIcon>
				)}
			</LoadingPercentageandIconContainer>
		</ProgressWrapper>
	);
};

export default ProgressBar;

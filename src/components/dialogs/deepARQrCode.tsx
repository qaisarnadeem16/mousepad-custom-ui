import React from 'react';
import QRCode from 'react-qr-code';
import styled from 'styled-components';

interface QRCodeGeneratorProps {
	url: string;
}

const QRCodeAndTitleContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: left;
	justify-content: center;
	padding: 20px;
	text-align: center;
	span {
		margin-top: 20px;
	}
`;

const QRCodeTitle = styled.span`
	font-size: 24px;
	color: black;
	font-weight: bold;
	margin: 0 0 20px 0;
`;

const QRCodeContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const DeepARQrCodeContentContainer: React.FC<QRCodeGeneratorProps> = ({ url }) => {
	return (
		<QRCodeAndTitleContainer>
			<QRCodeTitle>
				Scan the QR code to virtually <br></br> try your shoes
			</QRCodeTitle>
			<QRCodeContainer>
				<QRCode value={url} size={256} />
			</QRCodeContainer>
			<span>iOS 15+, iPad OS 15+ or Android with ARCore 1.9+ required</span>
		</QRCodeAndTitleContainer>
	);
};

export default DeepARQrCodeContentContainer;

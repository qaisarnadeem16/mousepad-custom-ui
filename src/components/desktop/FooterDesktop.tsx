import { TryOnMode, useZakeke } from '@zakeke/zakeke-configurator-react';
import { Button, Icon, TooltipContent } from 'components/Atomic';
import QuotationFormDialog from 'components/dialogs/QuotationFormDialog';
import SaveDesignsDraftDialog from 'components/dialogs/SaveDesignsDraftDialog';
import { T } from 'Helpers';
import { TailSpin } from 'react-loader-spinner';
import useStore from 'Store';
import styled from 'styled-components';
import { ReactComponent as PdfSolid } from '../../assets/icons/file-pdf-solid.svg';
import { ReactComponent as SaveSolid } from '../../assets/icons/save-solid.svg';
import { ReactComponent as ShareSolid } from '../../assets/icons/share-alt-square-solid.svg';
import { MessageDialog, QuestionDialog, useDialogManager } from '../dialogs/Dialogs';
import ErrorDialog from '../dialogs/ErrorDialog';
import PdfDialog from '../dialogs/PdfDialog';
import ShareDialog from '../dialogs/ShareDialog';
import {
	CustomQuotationConfirmMessage,
	ExtensionFieldItem,
	ExtensionFieldsContainer,
	PriceContainer,
	QuantityContainer
} from '../layout/SharedComponents';
import NumericInput from '../layout/NumericInput';
import NftDialog, { NftForm } from 'components/dialogs/NftDialog';
import useDropdown from 'hooks/useDropdown';
import { useEffect, useRef, useState } from 'react';

export const FooterContainer = styled.div`
	display: flex;
	flex-direction: row;
	height: 120px;
	border-top:1px solid #6633FF;
	background-color: #090B38;
	padding-top: 10px;
	border-bottom-right-radius: 30px;
	box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
`;

export const FooterRightElementsContainer = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	height: 70px;
	min-height: 70px;
	background-color: ;
	flex-direction: row;
	grid-gap: 10px;
	align-items: center;
	padding: 0px 15px;
	font-size: 14px;
	@media (max-width: 1024px) {
		min-height: 70px;
	}
`;

// Styled component for the container of the price information text
const PriceInfoTextContainer = styled.div`
	font-size: 26px;
	font-weight:600;
	font-family:Saira;
	color:white;
`;

// Styled component for the content of the out-of-stock tooltip
const OutOfStockTooltipContent = styled(TooltipContent)`
	max-width: 400px;
`;

// Styled component for the "Add to Cart" button
const AddToCartButton = styled(Button)`
	min-width: 150px;
	border-radius:10px;
	border:none;
    padding: 8px;
	font-size:20px;
	font-weight:500;
	font-family:Saira;
	background-color:#6633FF;
	&:hover {
        background-color: #4c26be;
		border:none;
      }
`;

// FooterDesktop component
const FooterDesktop = () => {
	// Custom hooks and state variables
	const [openOutOfStockTooltip, closeOutOfStockTooltip, isOutOfStockTooltipVisible, Dropdown] = useDropdown();
	const addToCartButtonRef = useRef<HTMLButtonElement>(null);
	const {
		useLegacyScreenshot,
		setCameraByName,
		getPDF,
		addToCart,
		isAddToCartLoading,
		sellerSettings,
		product,
		price,
		isOutOfStock,
		quantity,
		setQuantity,
		eventMessages,
		visibleEventMessages,
		additionalCustomProperties,
		saveComposition,
		createQuote,
		isMandatoryPD,
		getPrintingMethodsRestrictions,
		nftSettings
	} = useZakeke();
	const {
		setIsLoading,
		priceFormatter,
		isQuoteLoading,
		setIsQuoteLoading,
		isViewerMode,
		isDraftEditor,
		isEditorMode,
		setTryOnMode,
		tryOnRef,
		setIsPDStartedFromCart,
		pdValue,
		isSavingComposition,
		setIsSavingComposition
	} = useStore();
	const { showDialog, closeDialog } = useDialogManager();

	const pmRestrictions = getPrintingMethodsRestrictions();
	const pdfPreviewDisabled = pmRestrictions.isPDFPreviewEnabled === false;
	const [disableButtonsByVisibleMessages, setDisableButtonsByVisibleMessages] = useState(false);

	// Update the state variable disableButtonsByVisibleMessages based on visibleEventMessages
	useEffect(() => {
		if (visibleEventMessages && visibleEventMessages.some((msg) => msg.addToCartDisabledIfVisible))
			setDisableButtonsByVisibleMessages(true);
		else setDisableButtonsByVisibleMessages(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visibleEventMessages]);

	// Handle the "Add to Cart" button click event
	const handleAddToCart = () => {
		// Check if the product has mandatory personalization data and the value is less than 1
		if (isMandatoryPD && pdValue < 1) {
			setIsPDStartedFromCart(true);
			tryOnRef?.current?.setVisible?.(true);
			tryOnRef?.current?.changeMode?.(TryOnMode.PDTool);
			setTryOnMode(TryOnMode.PDTool);
			return;
		}
		// if you're saving a draft composition in backoffice
		if (isDraftEditor || isEditorMode) {
			setIsSavingComposition(true);
			saveComposition().then(() => {
				setIsSavingComposition(false);
				showDialog(
					'WelcomeMessage',
					<MessageDialog alignButtons='center' message={T._('Composition saved successfully', 'Composer')} />
				);
			});
		}
		// Check if there is a cart message visible and show a confirmation dialog
		const cartMessage = eventMessages?.find((message) => message.eventID === 4);
		if (cartMessage && cartMessage.visible && !isDraftEditor && !isEditorMode)
			showDialog(
				'question',
				<QuestionDialog
					alignButtons='center'
					eventMessage={cartMessage?.description}
					buttonNoLabel={T._('Cancel', 'Composer')}
					buttonYesLabel={T._('Add to cart', 'Composer')}
					onYesClick={() => {
						// Check if NFT is enabled and show the NFT dialog
						if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor && !isEditorMode)
							showDialog(
								'nft',
								<NftDialog
									nftTitle={T._(
										"You're purchasing a customized product together with an NFT.",
										'Composer'
									)}
									nftMessage={T._(
										'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
										'Composer'
									)}
									price={nftSettings.priceToAdd + price}
									buttonNoLabel={T._('Skip and continue', 'Composer')}
									buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
									onYesClick={(nftForm: NftForm) => {
										closeDialog('nft');
										addToCart([], undefined, useLegacyScreenshot, nftForm);
									}}
									onNoClick={() => {
										closeDialog('nft');
										addToCart([], undefined, useLegacyScreenshot);
									}}
								/>
							);
						else addToCart([], undefined, useLegacyScreenshot);
						closeDialog('question');
					}}
				/>
			);
		// If NFT is enabled, show the NFT dialog
		else if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor && !isEditorMode)
			showDialog(
				'nft',
				<NftDialog
					nftTitle={T._("You're purchasing a customized product together with an NFT.", 'Composer')}
					nftMessage={T._(
						'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
						'Composer'
					)}
					price={nftSettings.priceToAdd + price}
					buttonNoLabel={T._('Skip and continue', 'Composer')}
					buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
					onYesClick={(nftForm: NftForm) => {
						closeDialog('nft');
						addToCart([], undefined, useLegacyScreenshot, nftForm);
					}}
					onNoClick={() => {
						closeDialog('nft');
						addToCart([], undefined, useLegacyScreenshot);
					}}
				/>
			);
		else {
			addToCart([], undefined, useLegacyScreenshot);
		}
	};

	// Show an error dialog
	const showError = (error: string) => {
		showDialog('error', <ErrorDialog error={error} onCloseClick={() => closeDialog('error')} />);
	};

	// Handle the "Share" button click event
	const handleShareClick = async () => {
		setCameraByName('buy_screenshot_camera', false, false);
		showDialog('share', <ShareDialog />);
	};

	// Handle the "Save" button click event
	const handleSaveClick = async () => {
		showDialog('save', <SaveDesignsDraftDialog onCloseClick={() => closeDialog('save')} />);
	};

	// Handle the "PDF" button click event
	const handlePdfClick = async () => {
		try {
			setIsLoading(true);
			const url = await getPDF();
			showDialog('pdf', <PdfDialog url={url} onCloseClick={() => closeDialog('pdf')} />);
		} catch (ex) {
			console.error(ex);
			showError(T._('Failed PDF generation', 'Composer'));
		} finally {
			setIsLoading(false);
		}
	};

	// Handle the "Get a Quote" button click event
	const handleSubmitRequestQuote = async (formData: any) => {
		let thereIsARequiredFormEmpty = formData.some((form: any) => form.required && form.value === '');
		if (thereIsARequiredFormEmpty)
			showDialog(
				'error',
				<ErrorDialog
					error={T._(
						'Failed to send the quotation since there is at least 1 required field empty.',
						'Composer'
					)}
					onCloseClick={() => closeDialog('error')}
				/>
			);
		else
			try {
				closeDialog('request-quotation');
				setIsQuoteLoading(true);
				setCameraByName('buy_screenshot_camera', false, false);
				await saveComposition();
				await createQuote(formData);
				showDialog(
					'message',
					<MessageDialog
						windowDecorator={CustomQuotationConfirmMessage}
						message={T._('Request for quotation sent successfully', 'Composer')}
					/>
				);
				setIsQuoteLoading(false);
			} catch (ex) {
				console.error(ex);
				setIsQuoteLoading(false);
				showDialog(
					'error',
					<ErrorDialog
						error={T._(
							'An error occurred while sending request for quotation. Please try again.',
							'Composer'
						)}
						onCloseClick={() => closeDialog('error')}
					/>
				);
			}
	};

	// Handle the "Get Quote" button click event
	const handleGetQuoteClick = async () => {
		let rule = product?.quoteRule;
		if (rule)
			showDialog(
				'request-quotation',
				<QuotationFormDialog getQuoteRule={rule} onFormSubmit={handleSubmitRequestQuote} />
			);
	};

	// Check if the "Add to Cart" button should be visible based on the quote rule
	const isBuyVisibleForQuoteRule = product?.quoteRule ? product.quoteRule.allowAddToCart : true;

	return (
		<FooterContainer>
			{T.translations?.statics && (
				<>
					{/* Quantity input */}
					{product && product.quantityRule && (
						<QuantityContainer>
							<label>{T._d('Quantity')}</label>
							<NumericInput
								value={quantity}
								readOnly={
									product.quantityRule &&
									(product.quantityRule.step === null || product.quantityRule.step === 0)
										? false
										: true
								}
								onChange={(e: any) => {
									const newQuantity =
										e.currentTarget.value === ''
											? product?.quantityRule?.minQuantity
											: e.currentTarget.value;

									console.log('Quantity change:', newQuantity);
									setQuantity(newQuantity);
								}}
								min={
									product.quantityRule.minQuantity != null
										? Math.max(product.quantityRule.step || 1, product.quantityRule.minQuantity)
										: product.quantityRule.step || 1
								}
								max={
									product.quantityRule.maxQuantity != null
										? product.quantityRule.maxQuantity
										: undefined
								}
								step={product.quantityRule.step != null ? product.quantityRule.step : 1}
							/>
						</QuantityContainer>
					)}

					{/* Right elements container */}
					<FooterRightElementsContainer className='right-footer'>
						{/* Extension Fields */}
						{/* {additionalCustomProperties && (
							<ExtensionFieldsContainer>
								{additionalCustomProperties.map(
									(
										extensionField: {
											name: string;
											value: number;
											label: string;
											formatString: string;
										},
										index
									) => {
										return (
											<ExtensionFieldItem key={index}>
												<span>{T._d(extensionField.label)}</span>
												<div>
													{formatString(extensionField.formatString, extensionField.value.toString())}
													{extensionField.value}
												</div>
											</ExtensionFieldItem>
										);
									}
								)}
							</ExtensionFieldsContainer>
						)} */}

						{/* Price */}
						

						{/* PDF preview */}
						{/* {!pdfPreviewDisabled && (
							<Button key={'pdf'} onClick={() => handlePdfClick()}>
								<Icon>
									<PdfSolid />
								</Icon>
							</Button>
						)} */}

						{/* Save composition */}
						{/* {!isDraftEditor &&
							!isEditorMode &&
							!isViewerMode &&
							sellerSettings &&
							sellerSettings.canSaveDraftComposition && (
								<Button key={'save'} onClick={() => handleSaveClick()}>
									<Icon>
										<SaveSolid />
									</Icon>
								</Button>
							)} */}

						{/* Share */}
						{/* {sellerSettings &&
							sellerSettings.shareType !== 0 &&
							!isEditorMode &&
							!isDraftEditor &&
							!isEditorMode && (
								<Button key={'share'} onClick={() => handleShareClick()}>
									<Icon>
										<ShareSolid />
									</Icon>
								</Button>
							)} */}

						{/* Get a quote */}
						{/* {product?.quoteRule && !isViewerMode && !isDraftEditor && !isEditorMode && (
							<Button
								disabled={disableButtonsByVisibleMessages}
								key={'quote'}
								primary
								onClick={() => handleGetQuoteClick()}
							>
								{isQuoteLoading && <TailSpin color='#FFFFFF' height='25px' />}
								{!isQuoteLoading && <span>{T._('Get a quote', 'Composer')}</span>}
							</Button>
						)} */}

						{/* Add to cart */}
						{/* {isBuyVisibleForQuoteRule && !isViewerMode && ( */}
							<AddToCartButton
								ref={addToCartButtonRef}
								onPointerEnter={() => {
									if (isOutOfStock) openOutOfStockTooltip(addToCartButtonRef.current!, 'top', 'top');
								}}
								onPointerLeave={() => {
									closeOutOfStockTooltip();
								}}
								disabled={
									((isDraftEditor || isEditorMode) && isSavingComposition) ||
									(!(isDraftEditor || isEditorMode) &&
										(disableButtonsByVisibleMessages || isAddToCartLoading || isOutOfStock))
								}
								primary
								onClick={
									(!(isDraftEditor || isEditorMode) && !isAddToCartLoading) ||
									((isDraftEditor || isEditorMode) && !isSavingComposition)
										? () => handleAddToCart()
										: () => null
								}
							>
								{isAddToCartLoading && !(isDraftEditor || isEditorMode) && (
									<TailSpin color='#FFFFFF' height='25px' />
								)}
								{!isAddToCartLoading && !isOutOfStock && !(isDraftEditor || isEditorMode) && (
									<span>{T._('Add to cart', 'Composer')}</span>
								)}
								{!isAddToCartLoading && isOutOfStock && !(isDraftEditor || isEditorMode) && (
									<span>{T._('OUT OF STOCK', 'Composer')}</span>
								)}
								{(isDraftEditor || isEditorMode) && isSavingComposition && (
									<TailSpin color='#FFFFFF' height='25px' />
								)}
								{(isDraftEditor || isEditorMode) && !isSavingComposition && (
									<span>{T._('Save', 'Composer')}</span>
								)}
							</AddToCartButton>
						{/* // )} */}
					
					
					
					
					{/* {price !== null && price > 0 && (!sellerSettings || !sellerSettings.hidePrice) && ( */}
							<div className="">
								<div className="text-white opacity-30 Saira">
								<p className='text-base font-normal'>save 30%</p>
							   </div>
							
							<PriceContainer>
								{!isOutOfStock && priceFormatter.format(price)}
								{sellerSettings && sellerSettings.priceInfoText && (
									<PriceInfoTextContainer
										dangerouslySetInnerHTML={{ __html: sellerSettings.priceInfoText }}
									/>
								)}
							</PriceContainer>
							</div>
						{/* )} */}
					</FooterRightElementsContainer>

					{/* Out-of-stock tooltip */}
					{isOutOfStockTooltipVisible && isOutOfStock && (
						<Dropdown>
							<OutOfStockTooltipContent>
								{T._(
									'The configuration you have done is out-of-stock, please select different options to purchase this product.',
									'Composer'
								)}
							</OutOfStockTooltipContent>
						</Dropdown>
					)}
				</>
			)}
		</FooterContainer>
	);
};

export default FooterDesktop;

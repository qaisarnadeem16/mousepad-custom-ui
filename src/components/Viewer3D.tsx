/* eslint-disable @typescript-eslint/no-unused-vars */
import { useZakeke, ZakekeViewer } from '@zakeke/zakeke-configurator-react';
import { Button } from 'components/Atomic';
import ArDeviceSelectionDialog from 'components/dialogs/ArDeviceSelectionDialog';
import RecapPanel from 'components/widgets/RecapPanel';
import {
	findAttribute,
	findGroup,
	findStep,
	launchFullscreen,
	quitFullscreen,
	useActualGroups,
	useUndoRedoActions
} from 'Helpers';
import { UndoRedoStep } from 'Interfaces';
import { useEffect, useRef, useState } from 'react';
import useStore from 'Store';
import { ReactComponent as BarsSolid } from '../assets/icons/bars-solid.svg';
import { ReactComponent as CollapseSolid } from '../assets/icons/compress-arrows-alt-solid.svg';
import { ReactComponent as DesktopSolid } from '../assets/icons/desktop-solid.svg';
import { ReactComponent as ExplodeSolid } from '../assets/icons/expand-arrows-alt-solid.svg';
import { ReactComponent as ExpandSolid } from '../assets/icons/expand-solid.svg';

import AiDialog from 'components/dialogs/AIDialog';
import TryOnsButton from 'components/widgets/TryOnsButtons';
import { ReactComponent as RedoSolid } from '../assets/icons/redo-solid.svg';
import { ReactComponent as ResetSolid } from '../assets/icons/reset-alt-solid.svg';
import { ReactComponent as SearchMinusSolid } from '../assets/icons/search-minus-solid.svg';
import { ReactComponent as SearchPlusSolid } from '../assets/icons/search-plus-solid.svg';
import { ReactComponent as UndoSolid } from '../assets/icons/undo-solid.svg';
import { Dialog, useDialogManager } from './dialogs/Dialogs';
import {
	AiIcon,
	ArIcon,
	BottomRightIcons,
	CollapseIcon,
	DialogWindowDecorator,
	ExplodeIcon,
	FullscreenIcon,
	RecapPanelIcon,
	RedoIcon,
	ResetIcon,
	SecondScreenIcon,
	SpanAndButtonContainer,
	TopRightIcons,
	UndoIcon,
	ViewerContainer,
	ZoomInIcon,
	ZoomOutIcon
} from './layout/SharedComponents';
import Notifications from './widgets/Notifications';

// Styled component for the container of the 3D view.
const Viewer3D = () => {
	const ref = useRef<HTMLDivElement | null>(null);
	const {
		userSettings,
		isSceneLoading,
		IS_IOS,
		IS_ANDROID,
		getMobileArUrl,
		openArMobile,
		isSceneArEnabled,
		zoomIn,
		zoomOut,
		sellerSettings,
		reset,
		openSecondScreen,
		product,
		hasExplodedMode,
		setExplodedMode,
		hasVTryOnEnabled,
		getTryOnSettings,
		isInfoPointContentVisible,
		isAIEnabled
	} = useZakeke();

	const [isRecapPanelOpened, setRecapPanelOpened] = useState(
		sellerSettings?.isCompositionRecapVisibleFromStart ?? false
	);

	const { showDialog, closeDialog } = useDialogManager();
	const { setIsLoading, notifications, removeNotification, isDraftEditor, isEditorMode } = useStore();
	
	// HOTFIX for Coutie while RapidCompact resolves the issue with iOS AR
	const isCoutie = userSettings?.userID === 271265;
	useEffect(() => {
		if (sellerSettings && sellerSettings?.isCompositionRecapVisibleFromStart)
			setRecapPanelOpened(sellerSettings.isCompositionRecapVisibleFromStart);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sellerSettings]);

	const switchFullscreen = () => {
		if (
			(document as any).fullscreenElement ||
			(document as any).webkitFullscreenElement ||
			(document as any).mozFullScreenElement ||
			(document as any).msFullscreenElement
		) {
			quitFullscreen(ref.current!);
		} else {
			launchFullscreen(ref.current!);
		}
	};

	const handleArClick = async () => {
		if (IS_ANDROID || IS_IOS) {
			setIsLoading(true);
			const url = await getMobileArUrl();
			setIsLoading(false);
			if (url)
				if (IS_IOS && !isCoutie) {
					openArMobile(url as string);
				} else if (IS_ANDROID || isCoutie) {
					showDialog(
						'open-ar',
						<Dialog windowDecorator={DialogWindowDecorator} onClose={() => closeDialog('open-ar')} lighterOverlay={true}>
							<SpanAndButtonContainer>
							<span>Bring it to life in your space!</span>
							<Button
								style={{ display: 'block', width: '80%' }}
								onClick={() => {
									closeDialog('open-ar');
									openArMobile(url as string);
								}}
							>
								View in AR
							</Button>
							</SpanAndButtonContainer>
						</Dialog>
					);
				}
		} else {
			showDialog('select-ar', <ArDeviceSelectionDialog />);
		}
	};

	const { setIsUndo, undoStack, setIsRedo, redoStack } = useStore();
	const undoRedoActions = useUndoRedoActions();

	const handleUndoClick = () => {
		setIsUndo(true);

		let actualUndoStep = undoStack.length > 0 ? undoStack.pop() : null;
		if (actualUndoStep && actualUndoStep.length > 0) {
			undoRedoActions.fillRedoStack(actualUndoStep);
			actualUndoStep
				.filter((x: UndoRedoStep) => x.direction === 'undo')
				.forEach((singleStep: UndoRedoStep) => handleUndoSingleStep(singleStep));
		}

		setIsUndo(false);
	};

	const { undo, redo } = useZakeke();
	const { setSelectedGroupId, setSelectedStepId, setSelectedAttributeId, isMobile } = useStore();

	const actualGroups = useActualGroups() ?? [];

	const handleUndoSingleStep = (actualUndoStep: UndoRedoStep) => {
		if (actualUndoStep.id === null && !isMobile) return;
		if (actualUndoStep.type === 'group')
			return setSelectedGroupId(findGroup(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'step')
			return setSelectedStepId(findStep(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'attribute')
			return setSelectedAttributeId(findAttribute(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'option') {
			return undo();
		}
	};

	const handleRedoClick = () => {
		setIsRedo(true);

		let actualRedoStep = redoStack.length > 0 ? redoStack.pop() : null;
		if (actualRedoStep != null) {
			undoRedoActions.fillUndoStack(actualRedoStep);
			actualRedoStep
				.filter((x: UndoRedoStep) => x.direction === 'redo')
				.forEach(async (singleStep: UndoRedoStep) => handleRedoSingleStep(singleStep));
		}

		setIsRedo(false);
	};

	const handleRedoSingleStep = (actualRedoStep: { type: string; id: number | null; direction: string }) => {
		if (actualRedoStep.id === null && !isMobile) return;
		if (actualRedoStep.type === 'group')
			return setSelectedGroupId(findGroup(actualGroups, actualRedoStep.id)?.id ?? null);
		if (actualRedoStep.type === 'step')
			return setSelectedStepId(findStep(actualGroups, actualRedoStep.id)?.id ?? null);
		else if (actualRedoStep.type === 'attribute')
			return setSelectedAttributeId(findAttribute(actualGroups, actualRedoStep.id)?.id ?? null);
		else if (actualRedoStep.type === 'option') return redo();
	};

	return (
		<ViewerContainer ref={ref}>
			{!isSceneLoading && <ZakekeViewer bgColor='#00000000' />}

			{/* {!isInfoPointContentVisible && (
				<div className=''>
					<ZoomInIcon $isMobile={isMobile} key={'zoomin'} hoverable onClick={zoomIn}>
						<SearchPlusSolid />
					</ZoomInIcon>
					<ZoomOutIcon $isMobile={isMobile} key={'zoomout'} hoverable onClick={zoomOut}>
						<SearchMinusSolid />
					</ZoomOutIcon>
					{sellerSettings?.canUndoRedo && (
						<ResetIcon $isMobile={isMobile} key={'reset'} hoverable onClick={reset}>
							<ResetSolid />
						</ResetIcon>
					)}
					{sellerSettings?.canUndoRedo && (
						<UndoIcon $isMobile={isMobile} key={'undo'} hoverable onClick={handleUndoClick}>
							<UndoSolid />
						</UndoIcon>
					)}
					{sellerSettings?.canUndoRedo && (
						<RedoIcon $isMobile={isMobile} key={'redo'} hoverable onClick={handleRedoClick}>
							<RedoSolid />
						</RedoIcon>
					)}
					{!isSceneLoading && hasVTryOnEnabled && !isDraftEditor && !isEditorMode && (
						<TryOnsButton settings={getTryOnSettings()} />
					)}
					<BottomRightIcons>
						{hasExplodedMode() && product && !isSceneLoading && (
							<>
								<CollapseIcon hoverable onClick={() => setExplodedMode(false)}>
									<CollapseSolid />
								</CollapseIcon>
								<ExplodeIcon hoverable onClick={() => setExplodedMode(true)}>
									<ExplodeSolid />
								</ExplodeIcon>
							</>
						)}

						{product && product.isShowSecondScreenEnabled && !isDraftEditor && !isEditorMode && (
							<SecondScreenIcon key={'secondScreen'} hoverable onClick={openSecondScreen}>
								<DesktopSolid />
							</SecondScreenIcon>
						)}

						{!IS_IOS && (
							<FullscreenIcon
								className='fullscreen-icon'
								key={'fullscreen'}
								hoverable
								onClick={switchFullscreen}
							>
								<ExpandSolid />
							</FullscreenIcon>
						)}
					</BottomRightIcons>
					<TopRightIcons>
						{product &&
							product.isAiConfigurationEnabled &&
							isAIEnabled &&
							!isDraftEditor &&
							!isEditorMode && (
								<AiIcon
									$isArIconVisible={isSceneArEnabled()}
									onClick={() => showDialog('ai', <AiDialog />)}
								></AiIcon>
							)}

						{isSceneArEnabled() && !isDraftEditor && !isEditorMode && (
							<ArIcon onClick={() => handleArClick()} />
						)}
					</TopRightIcons>
					{sellerSettings?.isCompositionRecapEnabled && (
						<RecapPanelIcon key={'recap'} onClick={() => setRecapPanelOpened(!isRecapPanelOpened)}>
							<BarsSolid />
						</RecapPanelIcon>
					)}
					{sellerSettings?.isCompositionRecapEnabled && isRecapPanelOpened && (
						<RecapPanel key={'recapPanel'} onClose={() => setRecapPanelOpened(false)} />
					)}{' '}
				</div>
			)} */}

		
			{/* Notifications */}
			<Notifications
				notifications={notifications}
				onRemoveNotificationClick={(notification) => removeNotification(notification.id)}
			/>
		</ViewerContainer>
	);
};

export default Viewer3D;

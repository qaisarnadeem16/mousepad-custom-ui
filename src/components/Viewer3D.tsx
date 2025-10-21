/* eslint-disable @typescript-eslint/no-unused-vars */
import { useZakeke, ZakekeViewer } from '@zakeke/zakeke-configurator-react';
import { Button, Icon } from 'components/Atomic';
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
import { ReactComponent as ShareSolid } from '../assets/icons/share.svg';
import AiDialog from 'components/dialogs/AIDialog';
import TryOnsButton from 'components/widgets/TryOnsButtons';
import { ReactComponent as RedoSolid } from '../assets/icons/redo.svg';
import { ReactComponent as ResetSolid } from '../assets/icons/reset-alt-solid.svg';
import { ReactComponent as SearchMinusSolid } from '../assets/icons/zoom-minus.svg';
import { ReactComponent as SearchPlusSolid } from '../assets/icons/zoom-plus.svg';
import { ReactComponent as UndoSolid } from '../assets/icons/undo.svg';
import { ReactComponent as SaveSolid } from '../assets/icons/save-icon.svg';
import { ReactComponent as RotationIcon } from '../assets/icons/3d-rotate.svg';
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
import ShareDialog from './dialogs/ShareDialog';
import SaveDesignsDraftDialog from './dialogs/SaveDesignsDraftDialog';

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
		isAIEnabled,
		setCameraByName,
	} = useZakeke();
	const {isViewerMode}=useStore()

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

	const handleShareClick = async () => {
			setCameraByName('buy_screenshot_camera', false, false);
			showDialog('share', <ShareDialog />);
	};

	const handleSaveClick = async () => {
		showDialog('save', <SaveDesignsDraftDialog onCloseClick={() => closeDialog('save')} />);
	};


	return (
		<ViewerContainer ref={ref}>
			{!isSceneLoading && <ZakekeViewer bgColor='#00000000' />}
              {!isInfoPointContentVisible && (
            <div className="">
	          <div className="absolute top-4  flex items-center w-full z-10 justify-center">
                <div 
				 className="flex relative items-center gap-7 
    bg-[#070b3a]/90 text-white px-6 py-4 mx-auto md:w-auto justify-center w-full md:py-2 md:rounded-full 
    shadow-[0_0_40px_10px_rgba(102,51,255,0.4)] border border-indigo-700/40
    backdrop-blur-md"
				>
		  {sellerSettings?.canUndoRedo && (
			<div className="flex cursor-pointer items-center gap-2">
			  <UndoIcon $isMobile={isMobile} key={'undo'} hoverable onClick={handleUndoClick}>
				<UndoSolid />
			  </UndoIcon>
			  <p className='text-base md:block hidden'>Undo</p>
			</div>
		)}
		{sellerSettings?.canUndoRedo && (
			<div className="flex cursor-pointer items-center gap-2">
              <RedoIcon $isMobile={isMobile} key={'redo'} hoverable onClick={handleRedoClick}>
				<RedoSolid />
			  </RedoIcon>
			  <p className='text-base md:block hidden'>Redo</p>
			</div>
		)}
			{/* {!isDraftEditor &&
				!isEditorMode &&
				!isViewerMode &&
				sellerSettings &&
				sellerSettings.canSaveDraftComposition && ( */}
				<div className='flex gap-2 items-center cursor-pointer' key={'save'} onClick={() => handleSaveClick()}>
				    <SaveSolid />
				    <span className='text-base md:block hidden'>Save</span>
				</div>
			{/* )} */}
			{/* {sellerSettings && */}
			    {/* sellerSettings.shareType !== 0 &&
				!isEditorMode &&
				!isDraftEditor &&
				!isEditorMode && ( */}
				<div className="flex gap-2 items-center cursor-pointer" key={'share'} onClick={() => handleShareClick()}>
				    <ShareSolid />
					<p className='text-base md:block hidden'>Share</p>
				</div>
			{/* )} */}
        <div className="flex items-center cursor-pointer gap-2 hover:text-indigo-400 transition">
          <RotationIcon />
		  <span className="sm:inline text-sm hidden">Rotate</span>
        </div>

		<div className="flex cursor-pointer items-center gap-2">
          <ZoomInIcon $isMobile={isMobile} key={'zoomin'} hoverable onClick={zoomIn}>
			<SearchPlusSolid />
		 </ZoomInIcon>
		</div>
       
        <div className="flex cursor-pointer items-center gap-2">
		 <ZoomOutIcon $isMobile={isMobile} key={'zoomout'} hoverable onClick={zoomOut}>
			 <SearchMinusSolid />
		 </ZoomOutIcon>
		</div>
		{/* {sellerSettings?.canUndoRedo && (
			<ResetIcon $isMobile={isMobile} key={'reset'} hoverable onClick={reset}>
		      <ResetSolid />
		    </ResetIcon>
		)} */}
        {/* AR View Button */}
        {/* {isSceneArEnabled() && !isDraftEditor && !isEditorMode && ( */}
			<div onClick={() => handleArClick()} >
			  <h1 className='bg-[#6633FF] md:block hidden text-sm text-white py-2 px-4 hover:cursor-pointer hover:bg-blue-600 rounded-full'>AR View</h1>
			</div>
		{/* )} */}
      </div>
    </div>
 </div>
)}
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

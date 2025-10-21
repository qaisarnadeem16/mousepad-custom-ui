import React, { useState } from 'react';
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
} from '../layout/SharedComponents';
import AiDialog from 'components/dialogs/AIDialog';
import TryOnsButton from './TryOnsButtons';
import RecapPanel from './RecapPanel';

interface TopBarProps {
    isMobile: boolean;
    isInfoPointContentVisible: boolean;
    sellerSettings?: any;
    product?: any;
    isSceneLoading?: boolean;
    hasVTryOnEnabled?: boolean;
    isDraftEditor?: boolean;
    isEditorMode?: boolean;
    IS_IOS?: boolean;
    isSceneArEnabled?: () => boolean;
    isAIEnabled?: boolean;
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
    handleUndoClick: () => void;
    handleRedoClick: () => void;
    setExplodedMode: (value: boolean) => void;
    openSecondScreen: () => void;
    switchFullscreen: () => void;
    showDialog: (type: string, content: React.ReactNode) => void;
    handleArClick: () => void;
    setRecapPanelOpened: (value: boolean) => void;
    isRecapPanelOpened: boolean;
    getTryOnSettings: () => any;
}

const TopBar: React.FC<TopBarProps> = ({
    isMobile,
    isInfoPointContentVisible,
    sellerSettings,
    product,
    isSceneLoading,
    hasVTryOnEnabled,
    isDraftEditor,
    isEditorMode,
    IS_IOS,
    isSceneArEnabled,
    isAIEnabled,
    zoomIn,
    zoomOut,
    reset,
    handleUndoClick,
    handleRedoClick,
    setExplodedMode,
    openSecondScreen,
    switchFullscreen,
    showDialog,
    handleArClick,
    setRecapPanelOpened,
    isRecapPanelOpened,
    getTryOnSettings,
}) => {
    if (isInfoPointContentVisible) return null;

    return (
        <div className="bg-white shadow-md fixed w-full z-10 border-b border-gray-200 mx-auto">
            <div className="container mx-auto flex items-center justify-between p-4">
                {/* Left Side Icons (Zoom and Reset) */}
                <div className="flex space-x-2">
                    <ZoomInButton isMobile={isMobile} onClick={zoomIn} />
                    <ZoomOutButton isMobile={isMobile} onClick={zoomOut} />
                    {sellerSettings?.canUndoRedo && <ResetButton isMobile={isMobile} onClick={reset} />}
                    {sellerSettings?.canUndoRedo && <UndoButton isMobile={isMobile} onClick={handleUndoClick} />}
                    {sellerSettings?.canUndoRedo && <RedoButton isMobile={isMobile} onClick={handleRedoClick} />}
                    {!isSceneLoading && hasVTryOnEnabled && !isDraftEditor && !isEditorMode && (
                        <TryOnsButton settings={getTryOnSettings()} />
                    )}
                </div>

                {/* Right Side Icons */}
                <div className="flex space-x-2">
                    {/* Bottom Right Icons */}
                    <div className="flex space-x-2">
                        {hasExplodedMode() && product && !isSceneLoading && (
                            <>
                                <CollapseButton onClick={() => setExplodedMode(false)} />
                                <ExplodeButton onClick={() => setExplodedMode(true)} />
                            </>
                        )}
                        {product && product.isShowSecondScreenEnabled && !isDraftEditor && !isEditorMode && (
                            <SecondScreenButton onClick={openSecondScreen} />
                        )}
                        {!IS_IOS && <FullscreenButton onClick={switchFullscreen} />}
                    </div>

                    {/* Top Right Icons */}
                    <div className="flex space-x-2">
                        {product &&
                            product.isAiConfigurationEnabled &&
                            isAIEnabled &&
                            !isDraftEditor &&
                            !isEditorMode && (
                                <AiButton isArIconVisible={isSceneArEnabled?.()} onClick={() => showDialog('ai', <AiDialog />)} />
                            )}
                        {isSceneArEnabled?.() && !isDraftEditor && !isEditorMode && <ArButton onClick={handleArClick} />}
                    </div>

                    {/* Recap Panel */}
                    {sellerSettings?.isCompositionRecapEnabled && (
                        <RecapPanelButton onClick={() => setRecapPanelOpened(!isRecapPanelOpened)} />
                    )}
                    {sellerSettings?.isCompositionRecapEnabled && isRecapPanelOpened && (
                        <RecapPanel onClose={() => setRecapPanelOpened(false)} />
                    )}
                </div>
            </div>
        </div>
    );
};

// Individual Icon Button Components
const ZoomInButton: React.FC<{ isMobile: boolean; onClick: () => void }> = ({ isMobile, onClick }) => (
    <button
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isMobile ? 'text-sm' : ''}`}
        onClick={onClick}
    >
      +  {/* <SearchPlusSolid /> */}
    </button>
);

const ZoomOutButton: React.FC<{ isMobile: boolean; onClick: () => void }> = ({ isMobile, onClick }) => (
    <button
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isMobile ? 'text-sm' : ''}`}
        onClick={onClick}
    >
       -
    </button>
);

const ResetButton: React.FC<{ isMobile: boolean; onClick: () => void }> = ({ isMobile, onClick }) => (
    <button
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isMobile ? 'text-sm' : ''}`}
        onClick={onClick}
    >
        Reset
    </button>
);

const UndoButton: React.FC<{ isMobile: boolean; onClick: () => void }> = ({ isMobile, onClick }) => (
    <button
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isMobile ? 'text-sm' : ''}`}
        onClick={onClick}
    >
        UNdo
    </button>
);

const RedoButton: React.FC<{ isMobile: boolean; onClick: () => void }> = ({ isMobile, onClick }) => (
    <button
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isMobile ? 'text-sm' : ''}`}
        onClick={onClick}
    >
        Redo
    </button>
);

const CollapseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onClick}>
        Collapse
    </button>
);

const ExplodeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onClick}>
        Explode
    </button>
);

const SecondScreenButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onClick}>
        Desktop
    </button>
);

const FullscreenButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors fullscreen-icon" onClick={onClick}>
        ExpandSolid 
    </button>
);

const AiButton: React.FC<{ isArIconVisible?: boolean; onClick: () => void }> = ({ isArIconVisible, onClick }) => (
    <button
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isArIconVisible ? 'text-green-500' : ''}`}
        onClick={onClick}
    >
        {/* Assuming AiIcon is a custom component, replace with actual icon if needed */}
        <AiIcon />
    </button>
);

const ArButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onClick}>
        <ArIcon />
    </button>
);

const RecapPanelButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onClick}>
        BarsSolid 
    </button>
);

// Placeholder function (to be implemented based on your logic)
const hasExplodedMode = () => true; // Replace with your logic

export default TopBar;
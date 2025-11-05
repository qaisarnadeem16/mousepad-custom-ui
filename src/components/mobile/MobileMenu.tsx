import { Option, useZakeke } from '@zakeke/zakeke-configurator-react';
import { T, useActualGroups, useUndoRedoActions, useUndoRegister } from 'Helpers';
import { useEffect, useState } from 'react';
import useStore from 'Store';
import styled from 'styled-components';

import savedCompositionsIcon from '../../assets/icons/saved_designs.svg';
import star from '../../assets/icons/star.svg';
import uploadIcon from '../../assets/upload.svg';
import textIcon from '../../assets/Text.svg';
import galleryIcon from '../../assets/Gallery.svg';

import Designer from '../layout/Designer';
import DesignsDraftList from '../layout/DesignsDraftList';
import { MenuItem } from './MobileMenuComponents';

// ------------------ STYLES ------------------
export const MobileMenuContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	background-color: #090b38;
	position: relative;
	overflow: hidden;
`;

const BottomGroupBar = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #090b38;
	border-top: 1px solid #fff;
	border-top-left-radius: 16px;
	border-top-right-radius: 16px;
	display: flex;
	justify-content: space-evenly;
	overflow-x: auto;
	z-index: 400;
	padding: 12px 8px;
	gap: 8px;
	box-shadow: 0 0 18px 0 #6633ff;

	&::-webkit-scrollbar {
		height: 4px;
	}
	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
	}
`;

const GroupBarItem = styled.div<{ selected?: boolean }>`
	min-width: 75px;
	height: 70px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 4px;
	cursor: pointer;
	border-radius: 12px;
	background: ${(props) => (props.selected ? "#6633FF" : "rgba(255,255,255,0.05)")};
	box-shadow: ${(props) => (props.selected ? '0px 4px 12.9px 0px #6633FF' : 'none')};
	transition: all 0.2s ease;

	img {
		width: 40px;
		height: 40px;
		object-fit: contain;
		opacity: ${(props) => (props.selected ? 1 : 0.8)};
       filter: ${(props) => (props.selected ? "brightness(1.2)" : "brightness(0.9)")};
	}
`;

const DrawerOverlay = styled.div<{ isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 200;
	opacity: ${(props) => (props.isOpen ? 1 : 0)};
	pointer-events: ${(props) => (props.isOpen ? 'all' : 'none')};
	transition: opacity 0.3s ease;
`;

const DrawerContainer = styled.div<{ isOpen: boolean }>`
	position: fixed;
    bottom: 95px;
	left: 0;
	right: 0;
	background-color: #090b38;
	border-top-left-radius: 16px;
	border-top-right-radius: 16px;
	max-height: 70vh;
	z-index: 300;
	transform: translateY(${(props) => (props.isOpen ? '0' : '100%')});
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

const DrawerHeader = styled.div`
	padding: 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-shrink: 0;

	h3 {
		color: #fff;
		margin: 0;
		font-size: 18px;
	}
	button {
		background: transparent;
		border: none;
		color: #fff;
		font-size: 24px;
		cursor: pointer;
	}
`;

const TabsContainer = styled.div`
	display: flex;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	padding: 0 16px;
	flex-shrink: 0;
	overflow-x: auto;

	&::-webkit-scrollbar {
		height: 4px;
	}
	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
	}
`;

const Tab = styled.button<{ active: boolean }>`
	flex: 1;
	min-width: 100px;
	padding: 12px 16px;
	background: ${(props) => (props.active ? '#6633FFBF' : '#FFFFFFD4')};
	border: none;
	border: 2px solid ${(props) => (props.active ? '#6633ff' : 'transparent')};
	color: ${(props) => (props.active ? '#fff' : '#000')};
	cursor: pointer;
	font-size: 14px;
	font-weight: ${(props) => (props.active ? '600' : '400')};
	transition: all 0.2s ease;
	white-space: nowrap;

	&:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
	}
`;

const DrawerContent = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 16px 12px 24px 12px;
    max-height:32vh;
	&::-webkit-scrollbar {
		width: 6px;
	}
	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
	}
`;

const PriceInfoTextContainer = styled.div`
	font-size: 14px;
	padding: 10px;
	color: #fff;
`;

const OptionsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	gap: 12px;
	width: 100%;
`;

// ------------------ COMPONENT ------------------
const MobileMenu = () => {
	const {
		sellerSettings,
		selectOption,
		draftCompositions
	} = useZakeke();

	const {
		selectedGroupId,
		setSelectedGroupId,
		selectedAttributeId,
		setSelectedAttributeId,
		isUndo,
		isRedo
	} = useStore();

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isTemplateEditorOpened, setIsTemplateEditorOpened] = useState(false);
	const [isDesignsDraftListOpened, setisDesignsDraftListOpened] = useState(false);
	const [customizeTab, setCustomizeTab] = useState<'upload' | 'text' | 'gallery'>('upload');
	const [activeSubGroupIndex, setActiveSubGroupIndex] = useState(0);

	const undoRegistering = useUndoRegister();
	const undoRedoActions = useUndoRedoActions();
	const actualGroups = useActualGroups() ?? [];

	const sortedGroups = [...actualGroups].sort((a, b) => {
		const aIsSize = a.name?.toLowerCase().includes('size');
		const bIsSize = b.name?.toLowerCase().includes('size');
		if (aIsSize && !bIsSize) return -1;
		if (!aIsSize && bIsSize) return 1;
		return 0;
	});

	const selectedGroup = selectedGroupId ? sortedGroups.find((g) => g.id === selectedGroupId) : null;
	const selectedAttribute = selectedGroup?.attributes.find((a) => a.id === selectedAttributeId);
	const options = selectedAttribute?.options ?? [];

	const handleGroupSelection = (groupId: number | null) => {
		if (groupId && selectedGroupId !== groupId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'group', id: selectedGroupId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'group', id: groupId, direction: 'redo' });
		}
		setSelectedGroupId(groupId);
		setActiveSubGroupIndex(0);

		if (groupId === -2) {
			setIsTemplateEditorOpened(true);
			setIsDrawerOpen(false);
		} else if (groupId === -3) {
			setisDesignsDraftListOpened(true);
			setIsDrawerOpen(false);
		} else {
			setIsDrawerOpen(!!groupId);
			if (groupId) {
				const group = sortedGroups.find((g) => g.id === groupId);
				if (group && group.attributes.length > 0) {
					setSelectedAttributeId(group.attributes[0].id);
				}
			}
		}
	};

	const handleTabChange = (index: number) => {
		setActiveSubGroupIndex(index);
		if (selectedGroup && selectedGroup.attributes[index]) {
			setSelectedAttributeId(selectedGroup.attributes[index].id);
		}
	};

	const handleOptionSelection = (option: Option) => {
		const undo = undoRegistering.startRegistering();
		undoRedoActions.eraseRedoStack();
		undoRedoActions.fillUndoStack({
			type: 'option',
			id: options.find((opt) => opt.selected)?.id ?? null,
			direction: 'undo'
		});
		undoRedoActions.fillUndoStack({ type: 'option', id: option.id, direction: 'redo' });
		selectOption(option.id);
		undoRegistering.endRegistering(undo);
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedGroupId(null);
		setSelectedAttributeId(null);
	};

	// ------------------ RENDER ------------------
	return (
		<MobileMenuContainer>
			{sellerSettings?.priceInfoText && (
				<PriceInfoTextContainer
					dangerouslySetInnerHTML={{ __html: sellerSettings.priceInfoText }}
				/>
			)}
			<BottomGroupBar>
				{actualGroups &&
					!(actualGroups.length === 1 && actualGroups[0].name.toLowerCase() === 'other') &&
					sortedGroups.map((group) => {
						if (!group) return null;

						if (group.id === -2) {
							const staticGroups = [
								{ id: 'upload', name: 'Upload', icon: uploadIcon },
								{ id: 'text', name: 'Text', icon: textIcon },
								{ id: 'gallery', name: 'Gallery', icon: galleryIcon }
							];

							return staticGroups.map((staticGroup) => (
								<GroupBarItem
									key={staticGroup.id}
									selected={selectedGroupId === -2 && customizeTab === staticGroup.id}
									onClick={() => {
										handleGroupSelection(-2);
										setCustomizeTab(staticGroup.id as 'upload' | 'text' | 'gallery');
										setIsTemplateEditorOpened(true);
									}}
								>
									<img src={staticGroup.icon} alt={staticGroup.name} />
								</GroupBarItem>
							));
						}

						return (
							<GroupBarItem
								key={group.guid}
								selected={group.id === selectedGroupId}
								onClick={() => handleGroupSelection(group.id)}
							>
								<img
									src={
										group.imageUrl && group.imageUrl !== ''
											? group.id === -3
												? savedCompositionsIcon
												: group.imageUrl
											: star
									}
									alt={group.name ? T._d(group.name) : 'Customize'}
								/>
							</GroupBarItem>
						);
					})}
			</BottomGroupBar>

			<DrawerOverlay isOpen={isDrawerOpen} onClick={closeDrawer} />
			<DrawerContainer isOpen={isDrawerOpen}>
			  
				<DrawerHeader>
					<h3>{selectedGroup ? T._d(selectedGroup.name) : ''}</h3>
					<button onClick={closeDrawer}>×</button>
				  </DrawerHeader>
             <div className="">
				{/* Tabs for attributes */}
				{selectedGroup && selectedGroup.attributes.length > 1 && (
					<TabsContainer>
						{selectedGroup.attributes.map((attr, index) => (
							<Tab
								key={attr.guid}
								active={activeSubGroupIndex === index}
								onClick={() => handleTabChange(index)}
							>
								{T._d(attr.name)}
							</Tab>
						))}
					</TabsContainer>
				)}

				<DrawerContent>
					{selectedAttributeId && (
						<OptionsGrid>
							{options.map(
								(option) =>
									option.enabled && (
										<MenuItem
											key={option.guid}
											isRound={selectedAttribute?.optionShapeType === 2}
											description={T._d(option.description)}
											selected={option.selected}
											imageUrl={option.imageUrl ?? ''}
											label={T._d(option.name)}
											onClick={() => handleOptionSelection(option)}
										/>
									)
							)}
						</OptionsGrid>
					)}
				</DrawerContent>
			 </div>
			</DrawerContainer>

			{/* ✅ Designer Modal */}
			{selectedGroupId === -2 && <Designer customizeTab={customizeTab} />}

			{/* ✅ Draft Designs */}
			{draftCompositions && selectedGroup?.id === -3 && isDesignsDraftListOpened && (
				<DesignsDraftList
					onCloseClick={() => {
						setisDesignsDraftListOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}
		</MobileMenuContainer>
	);
};

export default MobileMenu;

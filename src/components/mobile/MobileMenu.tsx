import { Option, Step, ThemeTemplateGroup, useZakeke } from '@zakeke/zakeke-configurator-react';
import { T, useActualGroups, useUndoRedoActions, useUndoRegister } from 'Helpers';
import { Map } from 'immutable';
import { useEffect, useState } from 'react';
import useStore from 'Store';
import styled from 'styled-components';
import savedCompositionsIcon from '../../assets/icons/saved_designs.svg';
import star from '../../assets/icons/star.svg';
import noImage from '../../assets/images/no_image.png';
import Designer from '../layout/Designer';
import DesignsDraftList from '../layout/DesignsDraftList';
import { ItemName, Template, TemplatesContainer } from '../layout/SharedComponents';
import Steps from '../layout/Steps';
import { MenuItem, MobileItemsContainer } from './MobileMenuComponents';
import TemplateGroup from 'components/TemplateGroup';

// Main container
export const MobileMenuContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	background-color: #090B38;
	position: relative;
	overflow: hidden;
`;

// Bottom bar for groups (fixed at bottom)
const BottomGroupBar = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #090B38;
	border-top: 1px solid #fff;
	border-top-left-radius: 16px;
	border-top-right-radius: 16px;
	display: flex;
	overflow-x: auto;
	overflow-y: hidden;
	z-index: 400;
	padding: 8px;
	gap: 8px;
	box-shadow: 0 0 18px 0 #6633FF;
	
	&::-webkit-scrollbar {
		height: 4px;
	}
	
	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
	}
`;

// Group item in bottom bar
const GroupBarItem = styled.div<{ selected?: boolean }>`
	min-width: 80px;
	height: 80px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 8px;
	cursor: pointer;
	border-radius: 8px;
	background: ${props => props.selected ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
	border: 2px solid ${props => props.selected ? '#fff' : 'transparent'};
	transition: all 0.2s ease;
	
	&:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	
	img {
		width: 40px;
		height: 40px;
		object-fit: contain;
	}
	
	span {
		font-size: 11px;
		color: #fff;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
`;

// Overlay for drawer
const DrawerOverlay = styled.div<{ isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 200;
	opacity: ${props => props.isOpen ? 1 : 0};
	pointer-events: ${props => props.isOpen ? 'all' : 'none'};
	transition: opacity 0.3s ease;
`;

// Drawer container
const DrawerContainer = styled.div<{ isOpen: boolean }>`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #090B38;
	border-top-left-radius: 16px;
	border-top-right-radius: 16px;
	max-height: 70vh;
	z-index: 300;
	transform: translateY(${props => props.isOpen ? '0' : '100%'});
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	overflow: hidden;
	display: flex;
	flex-direction: column;
`;

// Drawer header
const DrawerHeader = styled.div`
	padding: 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	justify-content: space-between;
	align-items: center;
	
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
		padding: 4px 8px;
	}
`;

// Drawer content
const DrawerContent = styled.div`
	padding: 16px;
	overflow-y: auto;
	flex: 1;
`;

// Steps container in drawer
const StepsDrawerContainer = styled.div`
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	margin-bottom: 16px;
	padding-bottom: 16px;
`;

// Price info
const PriceInfoTextContainer = styled.div`
	font-size: 14px;
	padding: 10px;
	color: #fff;
`;

// Attributes grid in drawer
const AttributesGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	gap: 12px;
	margin-bottom: 16px;
`;

// Options grid in drawer
const OptionsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	gap: 12px;
`;

const MobileMenu = () => {
	const {
		isSceneLoading,
		templates,
		currentTemplate,
		setCamera,
		setTemplate,
		sellerSettings,
		selectOption,
		draftCompositions
	} = useZakeke();
	
	const {
		selectedGroupId,
		setSelectedGroupId,
		selectedAttributeId,
		setSelectedAttributeId,
		selectedStepId,
		setSelectedStepId,
		isUndo,
		isRedo,
		setSelectedTemplateGroupId,
		selectedTemplateGroupId,
		lastSelectedItem,
		setLastSelectedItem
	} = useStore();

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isTemplateEditorOpened, setIsTemplateEditorOpened] = useState(false);
	const [isDesignsDraftListOpened, setisDesignsDraftListOpened] = useState(false);
	const [isTemplateGroupOpened, setIsTemplateGroupOpened] = useState(false);
	const [isStartRegistering, setIsStartRegistering] = useState(false);
	const undoRegistering = useUndoRegister();
	const undoRedoActions = useUndoRedoActions();

	const actualGroups = useActualGroups() ?? [];

	const selectedGroup = selectedGroupId ? actualGroups.find((group) => group.id === selectedGroupId) : null;
	const selectedStep = selectedGroupId
		? actualGroups.find((group) => group.id === selectedGroupId)?.steps.find((step) => step.id === selectedStepId)
		: null;
	const currentAttributes = selectedStep ? selectedStep.attributes : selectedGroup ? selectedGroup.attributes : [];
	const currentTemplateGroups = selectedStep
		? selectedStep.templateGroups
		: selectedGroup
		? selectedGroup.templateGroups
		: [];

	const currentItems = [...currentAttributes, ...currentTemplateGroups].sort(
		(a, b) => a.displayOrder - b.displayOrder
	);

	const selectedAttribute = currentAttributes
		? currentAttributes.find((attr) => attr.id === selectedAttributeId)
		: null;

	const selectedTemplateGroup = currentTemplateGroups
		? currentTemplateGroups.find((templGr) => templGr.templateGroupID === selectedTemplateGroupId)
		: null;

	const options = selectedAttribute?.options ?? [];
	const groupIndex = actualGroups && selectedGroup ? actualGroups.indexOf(selectedGroup) : 0;

	const [lastSelectedSteps, setLastSelectedSteps] = useState(Map<number, number>());

	const handleNextGroup = () => {
		if (selectedGroup) {
			if (groupIndex < actualGroups.length - 1) {
				const nextGroup = actualGroups[groupIndex + 1];
				handleGroupSelection(nextGroup.id);
			}
		}
	};

	const handlePreviousGroup = () => {
		if (selectedGroup) {
			if (groupIndex > 0) {
				let previousGroup = actualGroups[groupIndex - 1];
				handleGroupSelection(previousGroup.id);

				if (previousGroup.steps.length > 0)
					handleStepSelection(previousGroup.steps[previousGroup.steps.length - 1].id);
				else if (previousGroup.attributes.length > 0)
					handleAttributeSelection(previousGroup.attributes[previousGroup.attributes.length - 1].id);
				else if (previousGroup.templateGroups.length > 0)
					handleTemplateGroupSelection(
						previousGroup.templateGroups[previousGroup.templateGroups.length - 1].templateGroupID
					);
			}
		}
	};

	const handleStepChange = (step: Step | null) => {
		if (step) handleStepSelection(step.id);
	};

	const handleGroupSelection = (groupId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (groupId && selectedGroupId !== groupId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'group', id: selectedGroupId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'group', id: groupId, direction: 'redo' });
		}

		setSelectedGroupId(groupId);
		
		// Open drawer when group is selected
		if (groupId && groupId !== -2 && groupId !== -3) {
			setIsDrawerOpen(true);
		} else {
			setIsDrawerOpen(false);
		}
	};

	const handleStepSelection = (stepId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (selectedStepId !== stepId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'step', id: selectedStepId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'step', id: stepId ?? null, direction: 'redo' });
		}

		setSelectedStepId(stepId);

		const newStepSelected = lastSelectedSteps.set(selectedGroupId!, stepId!);
		setLastSelectedSteps(newStepSelected);
	};

	const handleAttributeSelection = (attributeId: number) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (attributeId && selectedAttributeId !== attributeId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'attribute', id: selectedAttributeId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'attribute', id: attributeId, direction: 'redo' });
		}

		setSelectedAttributeId(attributeId);
		setLastSelectedItem({ type: 'attribute', id: attributeId });
	};

	const handleTemplateGroupSelection = (templateGroupId: number | null) => {
		setSelectedTemplateGroupId(templateGroupId);
		setLastSelectedItem({ type: 'template-group', id: templateGroupId });
		setIsTemplateGroupOpened(true);
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

		try {
			if ((window as any).algho) (window as any).algho.sendUserStopForm(true);
		} catch (e) {}
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedGroupId(null);
		setSelectedAttributeId(null);
		setSelectedTemplateGroupId(null);
	};

	const setTemplateByID = async (templateID: number) => await setTemplate(templateID);

	// Initial template selection
	useEffect(() => {
		if (templates.length > 0 && !currentTemplate) setTemplateByID(templates[0].id);
	}, [templates]);

	// Auto-selection if there is only 1 group
	useEffect(() => {
		if (actualGroups && actualGroups.length === 1 && actualGroups[0].id === -2) return;
		else if (actualGroups && actualGroups.length === 1 && !selectedGroupId) {
			setSelectedGroupId(actualGroups[0].id);
			setIsDrawerOpen(true);
		}
	}, [actualGroups, selectedGroupId]);

	// Reset attribute selection when group selection changes
	useEffect(() => {
		if (selectedGroup && selectedGroup.id !== -2) {
			if (selectedGroup.steps.length > 0) {
				if (
					lastSelectedSteps.get(selectedGroupId!) &&
					selectedGroup.steps.find((step) => step.id === lastSelectedSteps.get(selectedGroupId!)!)
				)
					handleStepSelection(lastSelectedSteps.get(selectedGroupId!)!);
				else {
					handleStepSelection(selectedGroup.steps[0].id);
					if (
						selectedGroup.steps[0].attributes.length === 1 &&
						selectedGroup.steps[0].templateGroups.length === 0
					)
						handleAttributeSelection(selectedGroup.steps[0].attributes[0].id);
					else if (
						selectedGroup.steps[0].templateGroups.length === 1 &&
						selectedGroup.steps[0].attributes.length === 0
					)
						handleTemplateGroupSelection(selectedGroup.steps[0].templateGroups[0].templateGroupID);
				}
			} else {
				handleStepSelection(null);
				if (selectedGroup.attributes.length === 1 && selectedGroup.templateGroups.length === 0)
					handleAttributeSelection(selectedGroup.attributes[0].id);
				else if (selectedGroup.templateGroups.length === 1 && selectedGroup.attributes.length === 0)
					handleTemplateGroupSelection(selectedGroup.templateGroups[0].templateGroupID);
			}
		}
	}, [selectedGroup?.id]);

	useEffect(() => {
		if (selectedGroup?.id === -2) {
			setIsTemplateEditorOpened(true);
			setIsDrawerOpen(false);
		}
	}, [selectedGroup?.id]);

	useEffect(() => {
		if (selectedGroup?.id === -3) {
			setisDesignsDraftListOpened(true);
			setIsDrawerOpen(false);
		}
	}, [selectedGroup?.id]);

	// Camera
	useEffect(() => {
		if (!isSceneLoading && selectedGroup && selectedGroup.cameraLocationId) {
			setCamera(selectedGroup.cameraLocationId, false);
		}
	}, [selectedGroup?.id, isSceneLoading]);

	useEffect(() => {
		if (selectedGroup && selectedGroup.steps.length > 0) {
			if (
				selectedGroup.steps.find((step) => step.id === selectedStep?.id) &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.attributes.length === 1 &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.templateGroups.length === 0
			)
				handleAttributeSelection(
					selectedGroup.steps!.find((step) => step.id === selectedStep?.id)!.attributes[0].id
				);
			else setSelectedAttributeId(null);
		}
	}, [selectedStep?.id]);

	useEffect(() => {
		if (isStartRegistering) {
			undoRegistering.endRegistering(false);
			setIsStartRegistering(false);
		}
	}, [isStartRegistering]);

	return (
		<MobileMenuContainer>
			{sellerSettings && sellerSettings.priceInfoText && (
				<PriceInfoTextContainer dangerouslySetInnerHTML={{ __html: sellerSettings.priceInfoText }} />
			)}

			{/* Bottom Group Bar */}
			<BottomGroupBar>
				{actualGroups.map((group) => (
					<GroupBarItem
						key={group.guid}
						selected={selectedGroupId === group.id}
						onClick={() => handleGroupSelection(group.id)}
					>
						<img
							src={group.id === -3 ? savedCompositionsIcon : group.imageUrl ? group.imageUrl : star}
							alt={group.name ? T._d(group.name) : T._('Customize', 'Composer')}
						/>
						<span>{group.name ? T._d(group.name) : T._('Customize', 'Composer')}</span>
					</GroupBarItem>
				))}
			</BottomGroupBar>

			{/* Drawer Overlay */}
			<DrawerOverlay isOpen={isDrawerOpen} onClick={closeDrawer} />

			{/* Drawer */}
			<DrawerContainer isOpen={isDrawerOpen}>
				<DrawerHeader>
					<h3>{selectedGroup ? T._d(selectedGroup.name) : ''}</h3>
					<button onClick={closeDrawer}>×</button>
				</DrawerHeader>

				<DrawerContent>
					{/* Steps */}
					{selectedGroup && selectedGroup.steps && selectedGroup.steps.length > 0 && (
						<StepsDrawerContainer>
							<Steps
								key={'steps-' + selectedGroup?.id}
								hasNextGroup={groupIndex !== actualGroups.length - 1}
								hasPreviousGroup={groupIndex !== 0}
								onNextStep={handleNextGroup}
								onPreviousStep={handlePreviousGroup}
								currentStep={selectedStep}
								steps={selectedGroup.steps}
								onStepChange={handleStepChange}
							/>
						</StepsDrawerContainer>
					)}

					{/* Templates */}
					{selectedGroup && selectedGroup.id === -2 && templates.length > 1 && (
						<TemplatesContainer>
							{templates.map((template) => (
								<Template
									key={template.id}
									selected={currentTemplate === template}
									onClick={async () => {
										await setTemplate(template.id);
									}}
								>
									{T._d(template.name)}
								</Template>
							))}
						</TemplatesContainer>
					)}

					{/* Attributes */}
					{!selectedAttributeId && !selectedTemplateGroupId && currentItems.length > 0 && (
						<AttributesGrid>
							{currentItems.map((item) => {
								if (!(item instanceof ThemeTemplateGroup))
									return (
										<MenuItem
											selected={item.id === selectedAttributeId}
											key={item.guid}
											onClick={() => handleAttributeSelection(item.id)}
											images={item.options
												.slice(0, 4)
												.map((x) => (x.imageUrl ? x.imageUrl : noImage))}
											label={T._d(item.name)}
											isRound={item.optionShapeType === 2}
										>
											<ItemName> {T._d(item.name).toUpperCase()} </ItemName>
										</MenuItem>
									);
								else
									return (
										<MenuItem
											selected={item.templateGroupID === selectedTemplateGroupId}
											key={item.templateGroupID}
											onClick={() => handleTemplateGroupSelection(item.templateGroupID)}
											imageUrl={noImage}
											label={T._d(item.name)}
											isRound={false}
										>
											<ItemName> {T._d(item.name).toUpperCase()} </ItemName>
										</MenuItem>
									);
							})}
						</AttributesGrid>
					)}

					{/* Options */}
					{lastSelectedItem?.type === 'attribute' && selectedAttribute && (
						<OptionsGrid>
							{selectedAttribute.options.map(
								(option) =>
									option.enabled && (
										<MenuItem
											isRound={selectedAttribute.optionShapeType === 2}
											description={T._d(option.description)}
											selected={option.selected}
											imageUrl={option.imageUrl ?? ''}
											label={T._d(option.name)}
											hideLabel={selectedAttribute.hideOptionsLabel}
											key={option.guid}
											onClick={() => handleOptionSelection(option)}
										/>
									)
							)}
						</OptionsGrid>
					)}

					{/* Template Group */}
					{selectedTemplateGroup && isTemplateGroupOpened && (
						<TemplateGroup
							key={selectedTemplateGroupId}
							templateGroup={selectedTemplateGroup!}
							isMobile
							onCloseClick={() => {
								setIsTemplateGroupOpened(false);
								handleTemplateGroupSelection(null);
								closeDrawer();
							}}
						/>
					)}
				</DrawerContent>
			</DrawerContainer>

			{/* Designer / Customizer */}
			{selectedGroup?.id === -2 && isTemplateEditorOpened && (
				<Designer
					onCloseClick={() => {
						setIsTemplateEditorOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}

			{/* Saved Compositions */}
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
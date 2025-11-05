import { FontFamily, useZakeke } from '@zakeke/zakeke-configurator-react';
import { debounce } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { CSSObjectWithLabel, GroupBase, OptionProps, SingleValueProps, components } from 'react-select';
import styled from 'styled-components';
import { T, wrapperJoin } from '../../Helpers';
import { Button, Columns, Icon, TextArea } from '../Atomic';

import type { PropChangeHandler } from '../layout/Designer';

import { ReactComponent as CurveIcon } from '../../assets/icons/bezier-curve-solid.svg';
import { ReactComponent as BoldIcon } from '../../assets/icons/bold-solid.svg';
import { ReactComponent as ItalicSolid } from '../../assets/icons/italic-solid.svg';
import { ReactComponent as CloseIcon } from '../../assets/icons/times-solid.svg';
import AdvancedSelect from './AdvancedSelect';
import { FormControl } from './FormControl';
import ColorPicker from './colorpicker';

export interface EditTextItem {
	guid: string;
	name: string;
	text: string;
	fillColor: string;
	fontFamily: string;
	fontWeight: string;
	fontSize: number;
	isTextOnPath: boolean;
	constraints: { [key: string]: any } | null;
}

const defaultColorsPalette = ['#000000', '#FFFFFF'];

enum ItemType {
	Text = 0,
	Image = 1
}

export interface TextItem {
	type: ItemType;
	areaId: number;
	guid: string;
	name: string;
	text: string;
	strokeColor: string;
	strokeWidth: number;
	fillColor: string;
	fontFamily: string;
	fontSize: number;
	fontWeight: string;
	fontStyle: string | undefined;
	fontStretch: string;
	justification: string;
	isTextOnPath: boolean;
	constraints: {
		[key: string]: any;
	} | null;
}

const RightToolsContainer = styled.div`
	display: flex;
	flex-direction: row;
	grid-gap: 10px;
`;

const ItemTextContainer = styled.div``;

const TextToolsContainer = styled.div`
	display: flex;
	flex-direction: row;
	grid-gap: 10px;
	flex-wrap: wrap;
`;

const TextButtonsContainer = styled.div`
	width: 45%;
	display: grid;
	grid-template-columns:1fr 1fr;
	grid-gap: 5px;
`;

const ColorPickerContainer = styled.div`
	margin-right: 5px;
	width: calc(50% - 30px);
`;

const ColorsContainer = styled.div`
	display: flex;
	flex-direction: row;
	padding-bottom: 20px;
	// border-bottom: 1px #ccc dotted;
`;

const SinglePaletteItem = styled.div<{ color: string; selected: boolean }>`
	width: 20px;
	height: 20px;
	background-color: ${(props) => props.color};
	border: 1px lightgray solid;
	cursor: pointer;

	${(props) => props.selected && `border: 1px black solid;`}

	&:hover {
		opacity: 0.6;
	}
`;

const TextColorsContainer = styled.div<{ $isDefaultPalette?: boolean }>`
	display: grid;
	${(props) =>
		!props.$isDefaultPalette &&
		`
    grid-template-columns: repeat(auto-fill,minmax(20px,1fr));
    grid-gap: 5px;`};
	/* grid-template-columns: repeat(auto-fill,minmax(20px,1fr)); */
	width: 100%;
`;

const FontCustomOption = styled.img`
	max-width: 100%;
	height: 24px;
	object-fit: contain;
`;

const FontCustomSingleValue = styled.img`
	max-width: 100%;
	height: 24px;
	object-fit: contain;
`;

const FontCustomSingleValueContainer = styled.div`
	display: flex;
	place-content: center;
	width: 100%;
	height: 100%;
`;

const FontOption = (props: JSX.IntrinsicAttributes & OptionProps<any, boolean, GroupBase<any>>) => {
	return (
		<components.Option {...props}>
			{<FontCustomOption src={props.data.imageUrl} alt={props.data.name} />}
		</components.Option>
	);
};

const FontSingleValue = (props: JSX.IntrinsicAttributes & SingleValueProps<any, boolean, GroupBase<any>>) => {
	return (
		<components.SingleValue {...props}>
			<FontCustomSingleValueContainer>
				{<FontCustomSingleValue src={props.data.imageUrl} alt={props.data.name} />}
			</FontCustomSingleValueContainer>
		</components.SingleValue>
	);
};

const ItemText: FC<{
	item: EditTextItem;
	handleItemPropChange: PropChangeHandler;
	fonts?: FontFamily[];
	inDialog?: boolean;
	hideRemoveButton?: boolean;
}> = ({ item, handleItemPropChange, inDialog, hideRemoveButton }) => {
	const { removeItem, fonts, getPrintingMethodsRestrictions, getSanitationText, moveItemDown, moveItemUp } =
		useZakeke();

	const constraints = item.constraints;
	const canEdit = constraints?.canEdit ?? true;
	const hasCurvedText = item.isTextOnPath;
	const isUpperCase = constraints?.toUppercase ?? false;

	let currentFont = fonts?.find((x) => x.name === item.fontFamily);

	const textRestrictions = getPrintingMethodsRestrictions();
	// Used for performance cache
	const [fillColor, setFillColor] = useState(item.fillColor);

	const [fontLoading, setFontLoading] = useState(false);
	const [dirtyCharInserted, setDirtyCharInserted] = useState([] as string[]);

	const weightData = typeof item.fontWeight === 'number' ? ['normal', 'normal'] : item.fontWeight.split(' ');
	const isBold = weightData.length > 1 ? weightData[1] === 'bold' : weightData[0] === 'bold';
	const isItalic = weightData.length > 1 ? weightData[0] === 'italic' : false;

	const setItemTextDebounced = (value: string) => {
		handleItemPropChange?.(item, 'text', isUpperCase ? value.toUpperCase() : value);
		debounce(() => {
			const initialText = value;
			const sanitizationInfo = currentFont
				? getSanitationText(currentFont, value)
				: {
						sanitizedText: value,
						dirtyChars: []
				  };
			setDirtyCharInserted(sanitizationInfo.dirtyChars);
			const text = sanitizationInfo.sanitizedText;

			if (text !== initialText) {
				handleItemPropChange?.(item, 'text', isUpperCase ? text.toUpperCase() : text);
			}
		}, 500)();
	};

	const handleFontChange = (font: string) => {
		handleItemPropChange(item, 'font-family', font);
		currentFont = fonts?.find((x) => x.name === font);
		setItemTextDebounced(item.text);
	};

	useEffect(() => {
		handleFontChange(item.fontFamily);
		//eslint-disable-next-line
	}, []);

	if (item)
		return (
			<ItemTextContainer>
				<FormControl
					label={item.name || T._('Text', 'Composer')}
					rightComponent={
						!hideRemoveButton &&
						item.constraints!.canDelete && (
							<RightToolsContainer>
								{/* <Icon onClick={() => moveItemUp(item.guid)}>
									<Icon>▲</Icon>
								</Icon>
								<Icon onClick={() => moveItemDown(item.guid)}>
									<Icon>▼</Icon>
								</Icon> */}
								<Icon onClick={() => removeItem(item.guid)}>
									<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                       <path d="M7 4C7 3.20435 7.31607 2.44129 7.87868 1.87868C8.44129 1.31607 9.20435 1 10 1H12C12.7956 1 13.5587 1.31607 14.1213 1.87868C14.6839 2.44129 15 3.20435 15 4H19.25C19.4489 4 19.6397 4.07902 19.7803 4.21967C19.921 4.36032 20 4.55109 20 4.75C20 4.94891 19.921 5.13968 19.7803 5.28033C19.6397 5.42098 19.4489 5.5 19.25 5.5H18V17C18 17.7956 17.6839 18.5587 17.1213 19.1213C16.5587 19.6839 15.7956 20 15 20H7C6.20435 20 5.44129 19.6839 4.87868 19.1213C4.31607 18.5587 4 17.7956 4 17V5.5H2.75C2.55109 5.5 2.36032 5.42098 2.21967 5.28033C2.07902 5.13968 2 4.94891 2 4.75C2 4.55109 2.07902 4.36032 2.21967 4.21967C2.36032 4.07902 2.55109 4 2.75 4H7ZM5.5 5.5V17C5.5 17.83 6.17 18.5 7 18.5H15C15.83 18.5 16.5 17.83 16.5 17V5.5H5.5ZM8.5 4H13.5C13.5 3.17 12.83 2.5 12 2.5H10C9.17 2.5 8.5 3.17 8.5 4ZM8.25 8H9.75V16H8.25V8ZM12.25 8H13.75V16H12.25V8Z" fill="white" fill-opacity="0.7" stroke="white" stroke-opacity="0.7" stroke-width="0.7"/>
                                    </svg>
								</Icon>
							</RightToolsContainer>
						)
					}
				>
					<TextArea
						defaultValue={isUpperCase ? item.text.toUpperCase() : item.text}
						onChange={(e) => {
							e.currentTarget.value = e.currentTarget.value.replace('⠀', '');
							setItemTextDebounced(e.currentTarget.value);
						}}
						maxLength={!item.constraints ? null : item.constraints.maxNrChars || null}
						disabled={!canEdit || fontLoading}
					/>
					{dirtyCharInserted.length > 0 && currentFont && (
						<div style={{ color: 'red' }}>
							{T._(
								`The following characters have been removed as they are not supported by the font ${
									currentFont.name
								}: ${wrapperJoin(dirtyCharInserted, ',', '"', '"')}`,
								'Composer'
							)}{' '}
						</div>
					)}
				</FormControl>

				<TextToolsContainer>
					{(!constraints || constraints.canChangeFontFamily) && (
						<FormControl label={T._('Font', 'Composer')}>
							<AdvancedSelect
								components={{
									Option: FontOption,
									SingleValue: FontSingleValue
								}}
								 styles={{
                                     container: (base) => ({
                                      ...base,
                                      width: 130
                                      }),
                                     control: (base) => ({
                                      ...base,
                                      backgroundColor: 'transparent',
                                      boxShadow: 'none',
									  borderRadius:'8px',
                                      borderColor: '#FFFFFF4D', // optional
                                        '&:hover': {
                                      borderColor: '#6a6a6a'
                                        }
                                      }),
                                    singleValue: (base) => ({
                                     ...base,
                                     backgroundColor: 'transparent',
                                     color: '#fff' // adjust if needed for contrast
                                     }),
                                    valueContainer: (base) => ({
                                      ...base,
                                      backgroundColor: 'transparent'
                                    }),
                                   input: (base) => ({
                                 ...base,
                               color: '#fff'
                                  }),
                                      placeholder: (base) => ({
                                      ...base,
                                      color: '#aaa'
                                   })
                                }}
								isSearchable={false}
								options={fonts}
								isDisabled={fontLoading}
								menuPosition='fixed'
								value={[fonts!.find((x) => x.name === item.fontFamily)]}
								onChange={(font: any) => {
									item.fontFamily = font.name;
									setFontLoading(true);
									handleFontChange(font.name);
									setTimeout(() => {
										setFontLoading(false);
									}, 2000);
								}}
							/>
						</FormControl>
					)}
					{(textRestrictions.allowedBold ||
						textRestrictions.allowedItalic ||
						textRestrictions.allowedCurved) && (
						<TextButtonsContainer>
							{(!constraints || constraints.canChangeFontWeight) &&
								(textRestrictions.allowedBold || textRestrictions.allowedItalic) && (
									<FormControl label={T._('Style', 'Composer')}>
										<Columns
											columns={
												textRestrictions.allowedBold && textRestrictions.allowedItalic ? 2 : 1
											}
										>
											{textRestrictions.allowedBold && (
												<Button
													outline
													selected={isBold}
													onClick={() => handleItemPropChange(item, 'font-bold', !isBold)}
												>
													<Icon>
														<svg width="11" height="15" viewBox="0 0 11 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                          <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H4.44C6.47 0 7.94 0.3 8.85 0.87C9.77 1.44 10.22 2.36 10.22 3.62C10.22 4.47 10.02 5.17 9.62 5.72C9.22 6.26 8.69 6.59 8.02 6.7V6.8C8.93 7 9.58 7.38 9.98 7.93C10.38 8.49 10.58 9.23 10.58 10.13C10.58 11.44 10.11 12.46 9.18 13.19C8.05573 13.9759 6.69938 14.3599 5.33 14.28H0V0ZM3.03 5.66H4.78C5.6 5.66 6.2 5.53 6.57 5.28C6.93 5.02 7.12 4.6 7.12 4.02C7.12 3.47 6.92 3.08 6.52 2.84C5.92747 2.56073 5.27362 2.43684 4.62 2.48H3.02V5.66H3.03ZM3.03 8.06V11.78H5C5.83 11.78 6.45 11.62 6.84 11.3C7.24 10.98 7.44 10.5 7.44 9.84C7.44 8.65 6.59 8.06 4.9 8.06H3.03Z" fill="white"/>
                                                        </svg>
													</Icon>
												</Button>
											)}
											{textRestrictions.allowedItalic && (
												<Button
													outline
													selected={isItalic}
													onClick={() => handleItemPropChange(item, 'font-italic', !isItalic)}
												>
													<Icon>
														<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                         <path fill-rule="evenodd" clip-rule="evenodd" d="M14.73 6.5L11.06 17.5H14L13.7 19H6L6.3 17.5H9.11L12.79 6.5H10L10.3 5H18L17.7 6.5H14.73Z" fill="white"/>
                                                        </svg>
													</Icon>
												</Button>
											)}
										</Columns>
									</FormControl>
								)}
							{/* {(!constraints || constraints.canChangeTextPathMode) && textRestrictions.allowedCurved && (
								<FormControl label={T._('Curved', 'Composer')}>
									<Button
										outline
										selected={hasCurvedText}
										onClick={() => handleItemPropChange(item, 'text-path', !hasCurvedText)}
									>
										<Icon>
											<CurveIcon />
										</Icon>
									</Button>
								</FormControl>
							)} */}
						</TextButtonsContainer>
					)}
				</TextToolsContainer>

				{(!textRestrictions.disableTextColors ||
					!(textRestrictions.disableTextColors && textRestrictions.textColors.length === 1)) &&
					!!item.constraints?.canChangeFontColor && (
						<FormControl label={T._('Color', 'Composer')}>
							<ColorsContainer>
								{!textRestrictions.disableTextColors && (
									<ColorPickerContainer>
										<ColorPicker
											color={fillColor}
											onChange={(color) => {
												// handleFillColorChange(color);
												handleItemPropChange(item, 'font-color', color);
												setFillColor(color);
											}}
										/>
									</ColorPickerContainer>
								)}

								{!textRestrictions.disableTextColors && (
									<TextColorsContainer $isDefaultPalette>
										{defaultColorsPalette.map((hex) => (
											<SinglePaletteItem
												key={hex}
												onClick={() => {
													handleItemPropChange(item, 'font-color', hex);
													setFillColor(hex);
												}}
												selected={hex === fillColor}
												color={hex}
											/>
										))}
									</TextColorsContainer>
								)}

								{textRestrictions.disableTextColors && (
									<TextColorsContainer>
										{textRestrictions.textColors.map((textColor) => (
											<SinglePaletteItem
												key={textColor.colorCode}
												onClick={() => {
													handleItemPropChange(item, 'font-color', textColor.colorCode);
													setFillColor(textColor.colorCode);
												}}
												selected={textColor.colorCode === fillColor}
												color={textColor.colorCode}
											/>
										))}
									</TextColorsContainer>
								)}
							</ColorsContainer>
						</FormControl>
					)}
			</ItemTextContainer>
		);
	else return null;
};

export default ItemText;

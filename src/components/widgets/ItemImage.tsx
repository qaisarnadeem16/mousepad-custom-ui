import { FC } from 'react';
import styled from 'styled-components';
import { TemplateArea, useZakeke } from '@zakeke/zakeke-configurator-react';
import { Button, Icon } from '../Atomic';
import { T } from '../../Helpers';
import { ReactComponent as CloseIcon } from '../../assets/icons/times-solid.svg';
import { FormControl } from './FormControl';
import ReuseBtn from './ReuseBtn';

export interface EditImageItem {
	guid: string;
	name: string;
	imageID: number;
	url: string;
	constraints: { [key: string]: any } | null;
}

declare enum ItemType {
	Text = 0,
	Image = 1
}
export interface Item {
	type: ItemType;
	guid: string;
	name: string;
	areaId: number;
	constraints: {
		[key: string]: any;
	} | null;
}

interface ImageItem {
	type: ItemType;
	imageID: number;
	areaId: number;
	guid: string;
	name: string;
	url: string;
	deleted: boolean;
	constraints: {
		[key: string]: any;
	} | null;
}

const ImageAndButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	grid-column-gap: 20px;
	input {
		display: none;
	}
`;

const ImagePreview = styled.div`
	/* border: 1px #f4f4f4 solid; */
	padding: 4px;
	height: 70px;
	width: 120px;
	border-radius: 15px;
	/* background: #f2f2f2; */
	img {
		display: block;
		width: 100%;
	border-radius: 10px;

		height: 100%;
		object-fit: cover;
	}
`;

const ButtonsContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 20px 0px;
`;

const RightToolsContainer = styled.div`
	display: flex;
	flex-direction: row;
	grid-gap: 10px;
`;

const ItemImage: FC<{
	item: ImageItem;
	handleItemPropChange: any;
	currentTemplateArea: TemplateArea;
	uploadImgDisabled: boolean;
}> = ({ item, handleItemPropChange, currentTemplateArea, uploadImgDisabled }) => {
	const { removeItem, moveItemDown, moveItemUp } = useZakeke();

	let inputHtml!: HTMLInputElement;

	const handleChangeClick = () => inputHtml.click();

	const handleGalleryClick = () => handleItemPropChange(item, 'image-gallery');

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.files && e.currentTarget.files.length > 0) {
			handleItemPropChange(item, 'image-upload', e.currentTarget.files![0]);
		}
		inputHtml.value = '';
	};

	const constraints = item.constraints;
	const canEdit = constraints ? constraints.canEdit : true;

	const showUploadButton =
		(!currentTemplateArea || currentTemplateArea.uploadRestrictions.isUserImageAllowed) && canEdit;
	const showGalleryButton = (!currentTemplateArea || !currentTemplateArea.disableSellerImages) && canEdit;

	return (
		<
			// FormControl
			// label={item.name || T._('Image', 'Composer')}
			// rightComponent={
			// 	constraints!.canDelete && (
			// 		<RightToolsContainer>
			// 			<Icon onClick={() => moveItemUp(item.guid)}>
			// 				<Icon>▲</Icon>
			// 			</Icon>
			// 			<Icon onClick={() => moveItemDown(item.guid)}>
			// 				<Icon>▼</Icon>
			// 			</Icon>
			// 			<Icon onClick={() => removeItem(item.guid)}>
			// 				<CloseIcon />
			// 			</Icon>
			// 		</RightToolsContainer>
			// 	)
			// }
		>
			<ImageAndButtonsContainer>
				<ImagePreview>
					<img src={item.url} alt='' />
				</ImagePreview>
				<div className='flex gap-2 items-center'>
					{showUploadButton && (
						<ReuseBtn variant='outline' disabled={uploadImgDisabled}  onClick={handleChangeClick}>
							{T._('Edit', 'Composer')}
						</ReuseBtn>
					)}
					{/* {showGalleryButton && (
						<ReuseBtn variant='delete' onClick={handleGalleryClick}>
							{T._('Gallery', 'Composer')}
						</ReuseBtn>
					)} */}
					<button onClick={() => removeItem(item.guid)}>
						<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7 4C7 3.20435 7.31607 2.44129 7.87868 1.87868C8.44129 1.31607 9.20435 1 10 1H12C12.7956 1 13.5587 1.31607 14.1213 1.87868C14.6839 2.44129 15 3.20435 15 4H19.25C19.4489 4 19.6397 4.07902 19.7803 4.21967C19.921 4.36032 20 4.55109 20 4.75C20 4.94891 19.921 5.13968 19.7803 5.28033C19.6397 5.42098 19.4489 5.5 19.25 5.5H18V17C18 17.7956 17.6839 18.5587 17.1213 19.1213C16.5587 19.6839 15.7956 20 15 20H7C6.20435 20 5.44129 19.6839 4.87868 19.1213C4.31607 18.5587 4 17.7956 4 17V5.5H2.75C2.55109 5.5 2.36032 5.42098 2.21967 5.28033C2.07902 5.13968 2 4.94891 2 4.75C2 4.55109 2.07902 4.36032 2.21967 4.21967C2.36032 4.07902 2.55109 4 2.75 4H7ZM5.5 5.5V17C5.5 17.83 6.17 18.5 7 18.5H15C15.83 18.5 16.5 17.83 16.5 17V5.5H5.5ZM8.5 4H13.5C13.5 3.17 12.83 2.5 12 2.5H10C9.17 2.5 8.5 3.17 8.5 4ZM8.25 8H9.75V16H8.25V8ZM12.25 8H13.75V16H12.25V8Z" fill="red" stroke="red" stroke-width="0.7" />
						</svg>

					</button>
				</div>
				{/* <input type='file' ref={(input) => (inputHtml = input!)} onChange={handleInputChange} /> */}
			</ImageAndButtonsContainer>
		</>
		
	);
};

export default ItemImage;

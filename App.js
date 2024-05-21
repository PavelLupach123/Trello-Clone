import Component from './library/Component.js';
import Header from './components/Header.js';
import Main from './components/Main.js';
import { saveState, loadState } from './state/localStorageState.js';
import {
	generateNextListId,
	toggleIsCardCreatorOpen,
	removeListByClickedId,
	generateNextCardId,
	moveList,
	moveCard,
	findListTitle,
	findCardTitle,
} from './state/controller.js';
import Modal from './components/Modal.js';

class App extends Component {
	constructor() {
		super();

		this.$dragTarget = null;
		this.selectedListId = null;
		this.selectedCardId = null;
		this.dropFromListIdx = null;
		this.dropFromListId = null;

		this.state = loadState();
		console.log('[Load State]', this.state);
	}

	render() {
		return `${new Header().render()}
		${new Main(this.state).render()}
		${new Modal(this.state).render()}`;
	}

	addEventListener() {
		return [
			{
				type: 'beforeunload',
				selector: 'window',
				handler: () => saveState(this.state),
			},
			{
				type: 'keydown',
				selector: 'window',
				handler: e => {
					if (e.key !== 'Escape') return;

					if (this.state.modal.isOpen) {
						this.closeModal();
					} else {
						this.closeAllCreator();
					}
				},
			},
			{ type: 'dragstart', selector: null, handler: this.onDragstart.bind(this) },
			{ type: 'dragend', selector: null, handler: this.onDragend.bind(this) },
			{ type: 'dragover', selector: null, handler: _.throttle(this.onDragover.bind(this)) },
			{ type: 'drop', selector: null, handler: this.onDrop.bind(this) },
			{
				type: 'click',
				selector: null,
				handler: this.onClick.bind(this),
			},
			{
				type: 'keydown',
				selector: null,
				handler: this.onKeydown.bind(this),
			},

			{ type: 'submit', selector: null, handler: this.onSubmit.bind(this) },
			{
				type: 'input',
				selector: null,
				handler: e => {
					if (!e.target.matches('textarea')) return;

					e.target.style.height = `${e.target.scrollHeight}px`;
				},
			},
		];
	}

	getListId($element) {
		return +$element.closest('.list-item').dataset.listId;
	}

	getListIndex($element) {
		return +$element.closest('.list-item').dataset.listIndex;
	}

	getCardId($element) {
		return +$element.closest('.card').dataset.cardId;
	}

	updateListTitle({ listId, value }) {
		const lists = this.state.lists.map(list => (list.id === listId ? { ...list, title: value } : list));

		this.setState({ lists });
	}

	toggleListCreatorBtns() {
		this.setState({ listCreator: { isOpen: !this.state.listCreator.isOpen } });
	}

	toggleCardCreatorBtns(target) {
		const lists = toggleIsCardCreatorOpen(this.state.lists, +target.closest('.list-item')?.dataset.listId);

		this.setState({ lists });
	}

	addNewList(value) {
		this.setState({
			lists: [
				...this.state.lists,
				{ id: generateNextListId(this.state.lists), title: value, cards: [], isCardCreatorOpen: false },
			],
		});
	}

	removeList(target) {
		const lists = removeListByClickedId(this.state.lists, this.getListId(target));

		this.setState({ lists });
	}

	addCard({ target, value }) {
		const cardId = generateNextCardId(this.state.lists.map(({ cards }) => cards).flat());
		const newCard = { id: cardId, title: value, description: '' };

		this.setState({
			lists: this.state.lists.map(list =>
				list.id === this.getListId(target) ? { ...list, cards: [...list.cards, newCard] } : list,
			),
		});
	}

	updateCardTitle(title) {
		this.setState({
			lists: this.state.lists.map(list =>
				list.id === this.selectedListId
					? {
							...list,
							cards: list.cards.map(card => (card.id === this.selectedCardId ? { ...card, title } : card)),
					  }
					: list,
			),
		});
	}

	removeCard(target) {
		const cardId = this.getCardId(target);
		const filterCard = list => list.cards.filter(({ id }) => id !== cardId);

		const lists = this.state.lists.map(list => ({ ...list, cards: filterCard(list) }));

		this.setState({ lists });
	}
	closeAllCreator() {
		const isSomeListCardCreatorOpen = this.state.lists.filter(({ isCardCreatorOpen }) => isCardCreatorOpen).length;

		if (isSomeListCardCreatorOpen === 0 && !this.state.listCreator.isOpen) {
			return;
		}

		this.setState({
			lists: this.state.lists.map(list => ({ ...list, isCardCreatorOpen: false })),
			listCreator: { isOpen: false },
		});
	}

	closeListCardCreator(e) {
		this.toggleCardCreatorBtns(e.target);
	}

	toggleModal() {
		this.setState({
			modal: {
				...this.state.modal,
				isOpen: !this.state.modal.isOpen,
				listId: this.selectedListId,
				cardId: this.selectedCardId,
			},
		});
	}

	closeModal() {
		if (!this.state.modal.isOpen) return;

		this.setState({
			modal: { ...this.state.modal, isOpen: false },
		});

		document.body.style.removeProperty('overflow');
	}

	toggleModalDescription(isCardDescCreatorOpen) {
		this.setState({ modal: { ...this.state.modal, isCardDescCreatorOpen } });
	}

	makeModalDescriptionCautionActive(target) {
		let $modalContainer = null;

		if (target.closest('.modal-container')) {
			$modalContainer = target.closest('.modal-container');
		} else if (target.closest('.overlay')) {
			$modalContainer = target.closest('#root').querySelector('.modal-container');
		}

		$modalContainer.querySelector('.caution').style.display = 'block';
		$modalContainer.querySelector('.modal-card-content-textarea').focus();
	}

	saveModalDescription(description) {
		this.setState({
			lists: this.state.lists.map(list =>
				list.id === this.selectedListId
					? {
							...list,
							cards: list.cards.map(card => (card.id === this.selectedCardId ? { ...card, description } : card)),
					  }
					: list,
			),
			modal: { ...this.state.modal, isCardDescCreatorOpen: !this.state.modal.isCardDescCreatorOpen },
		});
	}

	addDragImage() {
		const $fragment = document.createElement('div');
		const $fragmentChild = this.$dragTarget.cloneNode(true);

		$fragmentChild.classList.add('fragment');

		$fragment.appendChild($fragmentChild);
		document.body.appendChild($fragment);

		return $fragment;
	}

	removeDragImage() {
		const $fragment = document.querySelector('.fragment').parentNode;
		document.body.removeChild($fragment);
	}

	getYCoordinateCenter($elem) {
		const { bottom, top } = $elem.getBoundingClientRect();
		return (bottom - top) / 2;
	}

	onDragstart(e) {
		this.$dragTarget = e.target;

		const $dragImage = this.addDragImage();

		e.dataTransfer.setDragImage($dragImage, e.offsetX * 2, e.offsetY * 2);
		e.dataTransfer.effectAllowed = 'move';

		console.log('drag start');

		this.dropFromListIdx = this.getListIndex(this.$dragTarget);
		this.dropFromListId = this.getListId(this.$dragTarget);

		this.$dragTarget.classList.add('drag');
	}

	onDragend() {
		this.$dragTarget.classList.remove('drag');

		console.log('dragend');
		this.removeDragImage();
	}

	onDragover(e) {
		const $dropTarget = e.target;
		const $dropList = $dropTarget.closest('.list-item');

		e.preventDefault();

		if ($dropList === null) return;

		if (this.$dragTarget.matches('.list-item')) {
			if (this.$dragTarget === $dropList) return;

			const [prevDropFromIdx, currentDropToIdx] = [this.getListIndex(this.$dragTarget), this.getListIndex($dropList)];

			this.$dragTarget.parentNode.insertBefore(
				this.$dragTarget,
				prevDropFromIdx > currentDropToIdx ? $dropList : $dropList.nextElementSibling,
			);

			[...document.querySelectorAll('.list-item')].forEach(($listItem, idx) => {
				$listItem.dataset.listIndex = idx;
			});

			return;
		}

		if (this.$dragTarget.matches('.card')) {
			const $cardListContainer = $dropList.querySelector('.card-list-container');

			if ($cardListContainer.children.length === 0 || $dropTarget === $dropList) {
				$cardListContainer.appendChild(this.$dragTarget);
				return;
			}

			if ($dropTarget === this.$dragTarget || !$dropTarget.matches('.card')) return;

			$cardListContainer.insertBefore(
				this.$dragTarget,
				e.offsetY < this.getYCoordinateCenter($dropTarget) ? $dropTarget : $dropTarget.nextSibling,
			);
		}
	}

	onDrop() {
		if (this.$dragTarget.matches('.list-item')) {
			const [prevDropFromIdx, currentDropToIdx] = [this.dropFromListIdx, this.getListIndex(this.$dragTarget)];

			if (prevDropFromIdx === currentDropToIdx) return;

			const lists = moveList(this.state.lists, prevDropFromIdx, currentDropToIdx);

			setTimeout(() => {
				this.setState({ lists });
			}, 10);

			console.log('drop');

			return;
		}

		if (this.$dragTarget.matches('.card')) {
			const [cardId, prevDropFromId, currentDropToId] = [
				this.getCardId(this.$dragTarget),
				this.dropFromListId,
				this.getListId(this.$dragTarget),
			];

			const cardIndex = [...this.$dragTarget.parentNode.querySelectorAll('.card')].findIndex(
				$card => cardId === +$card.dataset.cardId,
			);

			const lists = moveCard({ lists: this.state.lists, cardId, prevDropFromId, currentDropToId, cardIndex });

			setTimeout(() => {
				this.setState({ lists });
			}, 10);

			console.log('drop');
		}
	}

	onClick(e) {
		if (e.target.nodeName === 'A') e.preventDefault();

		if (e.target.matches('.list-creator-open-btn') || e.target.matches('.list-creator-close-btn')) {
			this.toggleListCreatorBtns();
		}

		if (e.target.matches('.card-creator-open-btn') || e.target.matches('.card-creator-close-btn')) {
			this.toggleCardCreatorBtns(e.target);
		}

		if (e.target.matches('.add-list-btn')) {
			const [$textArea] = [...e.target.closest('.list-creator').children];

			const { value } = $textArea;
			$textArea.focus();

			if (value === '') {
				$textArea.blur();
				return;
			}

			this.addNewList(value);
		}

		if (e.target.matches('.delete-list-btn')) {
			this.removeList(e.target);
		}
		if (e.target.closest('.card')) {
			if (e.target.matches('.delete-card-btn')) {
				this.removeCard(e.target);
				return;
			}

			this.selectedListId = +e.target.closest('.list-item').dataset.listId;
			this.selectedCardId = +e.target.closest('.card').dataset.cardId;

			this.toggleModal();
			document.body.style.overflow = 'hidden';
		}
		
		if (e.target.matches('.modal-close-btn') || e.target.matches('.overlay')) {
			if (this.state.modal.isCardDescCreatorOpen) {
				this.makeModalDescriptionCautionActive(e.target);
				return;
			}

			this.toggleModal();
		}

		if (e.target.matches('.modal-card-content-textarea')) {
			if (this.state.modal.isCardDescCreatorOpen) return;

			this.toggleModalDescription(true);
		}

		if (e.target.matches('.description-close-btn')) {
			this.toggleModalDescription(false);
		}

		if (e.target.matches('.save-btn')) {
			const { value: description } = e.target.closest('.modal-card-content').querySelector('textarea');

			this.saveModalDescription(description);
		}

		if (this.state.modal.isCardDescCreatorOpen && e.target.closest('.modal-container')) {
			if (e.target.matches('.modal-card-content-textarea') || e.target.closest('.description-control')) return;

			this.makeModalDescriptionCautionActive(e.target);
		}
	}

	onKeydown(e) {
		if (e.isComposing) return;
		if (e.key !== 'Enter' && e.key !== 'Escape') return;

		if (e.key === 'Escape') {
			e.stopPropagation();

			if (e.target.matches('.new-list-title')) {
				this.toggleListCreatorBtns();
				return;
			}

			if (e.target.matches('.new-card-title')) {
				this.closeListCardCreator(e);
				return;
			}

			if (e.target.matches('.list-item-title')) {
				const listId = this.getListId(e.target);

				this.updateListTitle({ listId, value: e.target.value });
			}

			if (e.target.matches('.modal-card-title-textarea')) {
				const currentCardTitle = findCardTitle({
					lists: this.state.lists,
					listId: this.selectedListId,
					cardId: this.selectedCardId,
				});

				const { value } = e.target;

				if (value === '' || value === currentCardTitle) {
					e.target.value = currentCardTitle;
				}

				e.target.blur();
			}

			if (e.target.matches('.modal-card-content-textarea')) {
				this.toggleModalDescription(false);
			}
			e.target.blur();
		}

		if (e.key === 'Enter') {
			const value = e.target.value.trim();

			if (e.target.matches('.list-item-title')) {
				const listId = this.getListId(e.target);

				const currentValue = findListTitle({ lists: this.state.lists, listId });

				if (value === '') {
					e.target.value = currentValue;

					e.target.blur();
					return;
				}

				if (value !== currentValue) {
					this.updateListTitle({ listId, value });
				}

				e.target.blur();
			}

			if (e.target.matches('.new-list-title')) {
				if (value === '') return;

				this.addNewList(value);
			}

			if (e.target.matches('.new-card-title')) {
				e.preventDefault();

				if (value !== '') this.addCard({ target: e.target, value });
			}

			if (e.target.matches('.modal-card-title-textarea')) {
				e.preventDefault();

				const currentCardTitle = findCardTitle({
					lists: this.state.lists,
					listId: this.selectedListId,
					cardId: this.selectedCardId,
				});

				if (value === '' || value === currentCardTitle) {
					e.target.value = currentCardTitle;
					return;
				}

				this.updateCardTitle(value);

				e.target.blur();
			}
		}
	}

	onSubmit(e) {
		e.preventDefault();

		const $textArea = e.target.querySelector('textarea');
		const value = $textArea?.value.trim();

		if (e.target.matches('.card-creator')) {
			if (value === '') return;

			this.addCard({ target: e.target, value });
		}
	}
}

export default App;

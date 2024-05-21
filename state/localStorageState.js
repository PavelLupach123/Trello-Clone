const KEY = 'state';
const initialState = {
	lists: [
		{
			id: 1,
			title: 'Завдання 1',
			cards: [
				{ id: 1, title: '1', description: '1' },
				{ id: 2, title: '2', description: '2' },
			],
			isCardCreatorOpen: false,
		},
		{
			id: 2,
			title: 'Завдання 2',
			cards: [{ id: 3, title: '1', description: '' }],
			isCardCreatorOpen: false,
		},
		{
			id: 3,
			title: 'Завдання 3',
			cards: [
				{ id: 4, title: '1', description: '' },
				{ id: 5, title: '2', description: '' },
				{ id: 6, title: '3', description: '' },
			],
			isCardCreatorOpen: false,
		},
	],
	listCreator: {
		isOpen: false,
	},
	modal: {
		isOpen: false,
		isCardDescCreatorOpen: false,
		listId: null,
		cardId: null,
	},
};

const loadState = () => JSON.parse(localStorage.getItem(KEY)) || initialState;

const saveState = newState => localStorage.setItem(KEY, JSON.stringify(newState));

export { loadState, saveState };

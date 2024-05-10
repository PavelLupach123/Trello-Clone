const propertyList = ['checked', 'value', 'selected'];

const updateAttributes = (oldNode, newNode) => {
	if (oldNode.tagName === newNode.tagName) {
		if (!(oldNode instanceof Text) && !(newNode instanceof Text)) {
			for (const { name, value } of [...newNode.attributes]) {
				if (value !== oldNode.getAttribute(name)) oldNode.setAttribute(name, value);
			}

			for (const { name } of [...oldNode.attributes]) {
				if (!newNode.getAttribute(name) === undefined || newNode.getAttribute(name) === null)
					oldNode.removeAttribute(name);
			}
		}

		for (const property of propertyList) {
			if (oldNode[property] !== newNode[property]) oldNode[property] = newNode[property];
		}
	}
};

const diff = (oldNode, newNode, parent = null) => {
	if (parent) {
		if (!oldNode && newNode) {
			parent.appendChild(newNode);
			return;
		}

		if (oldNode && !newNode) {
			parent.removeChild(oldNode);
			return;
		}

		if (oldNode instanceof Text && newNode instanceof Text) {
			if (oldNode.nodeValue.trim() === '') return;
			if (oldNode.nodeValue !== newNode.nodeValue) oldNode.nodeValue = newNode.nodeValue;

			return;
		}

		if (oldNode.nodeType === Node.COMMENT_NODE || newNode.nodeType === Node.COMMENT_NODE) return;

		if (oldNode.tagName !== newNode.tagName) {
			parent.replaceChild(newNode, oldNode);
			return;
		}

		updateAttributes(oldNode, newNode);
	}

	const [oldNodes, newNodes] = [[...oldNode.childNodes], [...newNode.childNodes]];
	const maxLength = Math.max(oldNodes.length, newNodes.length);

	for (let i = 0; i < maxLength; i++) {
		diff(oldNodes[i], newNodes[i], oldNode);
	}
};

export default diff;

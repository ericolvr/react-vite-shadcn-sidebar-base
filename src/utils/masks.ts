

export const applyPhoneMask = (value: string): string => {
	const numbers = value.replace(/\D/g, '')
	
	if (numbers.length <= 2) {
		return numbers
	} else if (numbers.length <= 6) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
	} else if (numbers.length <= 10) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
	} else {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
	}
}


export const applyMobileMask = (value: string): string => {
	const numbers = value.replace(/\D/g, '')
	
	if (numbers.length <= 2) {
		return numbers
	} else if (numbers.length <= 7) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
	} else if (numbers.length <= 11) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
	} else {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
	}
}

export const applyTimeMask = (value: string): string => {
	const numbers = value.replace(/\D/g, '')
	
	if (numbers.length <= 2) {
		return numbers
	} else if (numbers.length <= 4) {
		return `${numbers.slice(0, 2)}:${numbers.slice(2)}`
	} else {
		return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`
	}
}


export const extractNumbers = (value: string): string => {
	return value.replace(/\D/g, '')
}

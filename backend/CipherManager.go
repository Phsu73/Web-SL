package main

type Cipher struct {
	ID     int    `json:"id"`
	Answer string `json:"answer"`
}

type CipherData struct {
	Ciphers []Cipher `json:"ciphers"`
}

// func checkAnswer(cipherId int, userAnswer string, ciphers []Cipher) bool {
// 	for _, c := range ciphers {
// 		if c.ID == cipherId {
// 			return userAnswer == c.Answer
// 		}
// 	}
// 	return false
// }

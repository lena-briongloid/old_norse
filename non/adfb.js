function load_adfb(call = false) {
	let text = "";

	if (call == false) {
		text = document.getElementById("text").value;
		document.getElementById("text").value = "";
	}
	else {
		text = call;
	}

	text = text.trim();

	//filer bad words
	const badSearch = ["", " ", "-", "=", ".", ",", ";", ":", "/"];
	if (badSearch.includes(text)) { return -1; }

	//special commands
	let query_command = load_query_command(text, call);
	if (query_command == true) { return -1; }
	
	//exacts
	let index = -1;

	//very exact
	for (var i = 0; i < dict.length; i ++) {
		let t = text.toLowerCase();
		let d1 = grid(dict, column.title, i).toLowerCase();
		let d2 = grid(dict, column.key, i).toLowerCase();

		if (t == d1 || t == d2) { index = i; break; }
	}

	//less exact
	if (index == -1) { for (var i = 0; i < dict.length; i ++) {
		let t = text.toLowerCase();
		let d1 = remove_diacritics(grid(dict, column.title, i).toLowerCase());
		let d2 = remove_diacritics(grid(dict, column.key, i).toLowerCase());

		if (t == d1 || t == d2) { index = i; break; }
	} }

	//undo stack
	if (call == false) {
		if (index >= 0) { undo_stack(grid(dict, column.key, index)); }
		else { undo_stack(text); }
	}

	//한글이 입력되면 역방향 검색으로 보냄
	let regexHan = /[가-힣]/;
	if (regexHan.test(text)) {
		load_query_ko(text, call);
		return -1;
	}

	var text_search = text.split("_")[0];
	load_query_suggest(text_search); load_query_include(text_search);

	show_page(["search_form", "suggestions"], ["mainpage"]);

	if (index == -1) {
		//not found
		show_page(["not_found"], ["ADFB", "abc"]);
	}
	else {
		//found
		show_page(["ADFB", "abc"], ["not_found"]);
	}

	// if got -1 immed. end
	if (index == -1) { return 0; }

///////////////////////////////////
//title
	let t1 = document.getElementsByClassName("ADFB_word_class")[0];
	if (grid(dict, column.class, index) == "m") {
		t1.innerHTML = "남성 명사.";
	}
	else if (grid(dict, column.class, index) == "f") {
		t1.innerHTML = "여성 명사.";
	}
	else if (grid(dict, column.class, index) == "n") {
		t1.innerHTML = "중성 명사.";
	}
	else if (grid(dict, column.class, index) == "a") {
		t1.innerHTML = "형용사.";
	}
	else if (grid(dict, column.class, index) == "i") {
		t1.innerHTML = "불변사.";
		document.getElementById("gram").innerHTML = "";
	}
	else if (grid(dict, column.class, index) == "v") {
		t1.innerHTML = "동사.";
		document.getElementById("gram").innerHTML = "";
	}
	else {
		t1.innerHTML = "ERR"
	}
	
///////////////////////////////////
//headword
	let t2 = document.getElementsByClassName("ADFB_head_word")[0];
	t2.innerHTML = grid(dict, column.title, index) + "<sup>" + grid(dict, column.tag_synonym, index) + "</sup>";
	let t3 = document.getElementsByClassName("ADFB_head_sound")[0];
	t3.innerHTML = "<span class=\"IPA\">[" + grid(dict, column.pronounce_ko, index) + "]</span>";

///////////////////////////////////
//grammar
	let word_class = grid(dict, column.class, index);
	let source_gram = "";

	//make grammar array
	let gram = []; let sound = [];
	for (var i = 0; column.grammar + i < column.length; i ++) {
		let data = grid(dict, column.grammar + i, index).split("<br>");
		//valid
		if (data.length == 2) {
			gram.push(data[0]); sound.push("[" + data[1] + "]");
		}
		//invalid
		else {
			gram.push("-"); sound.push("-");
		}
	}

	if (word_class == "m" || word_class == "f" || word_class == "n") {
		source_gram = "<details><summary style=\"font-size: 18px;\">문법 정보 보기</summary>";

		source_gram += "<table><tr><td>&nbsp;</td><td><strong>부정형</strong></td><td><strong>정형</strong></td></tr>";

		source_gram += "<tr><td><strong>단수 주격</strong><sub>(~이/가)</sub></td>";
		source_gram += "<td><p><strong>" + gram[0] + "</strong></p><small class=\"IPA\">" + sound[0] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[4] + "</strong></p><small class=\"IPA\">" + sound[4] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>단수 속격</strong><sub>(~의)</sub></td>";
		source_gram += "<td><p><strong>" + gram[1] + "</strong></p><small class=\"IPA\">" + sound[1] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[5] + "</strong></p><small class=\"IPA\">" + sound[5] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수 주격</strong><sub>(~들이)</sub></td>";
		source_gram += "<td><p><strong>" + gram[2] + "</strong></p><small class=\"IPA\">" + sound[2] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[6] + "</strong></p><small class=\"IPA\">" + sound[6] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수 속격</strong><sub>(~들의)</sub></td>";
		source_gram += "<td><p><strong>" + gram[3] + "</strong></p><small class=\"IPA\">" + sound[3] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[7] + "</strong></p><small class=\"IPA\">" + sound[7] + "</small></p></td></tr>";

		source_gram += "</table><p></p></details>";
	}
	else if (word_class == "a") {
		source_gram = "<details><summary style=\"font-size: 18px;\">문법 정보 보기</summary>";

		if (gram[0] != "-") {

		source_gram += "<p><strong>원급 강변화</strong>: 단독으로 쓰일 때, 부정형 명사를 수식할 때</p>";

		source_gram += "<table><tr><td>&nbsp;</td><td><strong>남성</strong></td><td><strong>여성</strong></td><td><strong>중성</strong></td></tr>";

		source_gram += "<tr><td><strong>단수 주격</strong><sub>(~이/가)</sub></td>";
		source_gram += "<td><p><strong>" + gram[0] + "</strong></p><small class=\"IPA\">" + sound[0] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[1] + "</strong></p><small class=\"IPA\">" + sound[1] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[2] + "</strong></p><small class=\"IPA\">" + sound[2] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>단수 속격</strong><sub>(~의)</sub></td>";
		source_gram += "<td><p><strong>" + gram[3] + "</strong></p><small class=\"IPA\">" + sound[3] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[4] + "</strong></p><small class=\"IPA\">" + sound[4] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[5] + "</strong></p><small class=\"IPA\">" + sound[5] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수 주격</strong><sub>(~들이)</sub></td>";
		source_gram += "<td><p><strong>" + gram[6] + "</strong></p><small class=\"IPA\">" + sound[6] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[7] + "</strong></p><small class=\"IPA\">" + sound[7] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[8] + "</strong></p><small class=\"IPA\">" + sound[8] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수 속격</strong><sub>(~들의)</sub></td>";
		source_gram += "<td colspan=\"3\"><p><strong>" + gram[9] + "</strong></p><small class=\"IPA\">" + sound[9] + "</small></p></td></tr></table><hr>";

		}

		if (gram[10] != "-") {

		source_gram += "<p><strong>원급 약변화</strong>: 고유명사와 정형 명사를 수식할 때</p>";

		source_gram += "<table><tr><td>&nbsp;</td><td><strong>남성</strong></td><td><strong>여성</strong></td><td><strong>중성</strong></td></tr>";

		source_gram += "<tr><td><strong>단수 주격</strong><sub>(~이/가)</sub></td>";
		source_gram += "<td><p><strong>" + gram[10] + "</strong></p><small class=\"IPA\">" + sound[10] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[11] + "</strong></p><small class=\"IPA\">" + sound[11] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[11] + "</strong></p><small class=\"IPA\">" + sound[11] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>단수 속격</strong><sub>(~의)</sub></td>";
		source_gram += "<td><p><strong>" + gram[11] + "</strong></p><small class=\"IPA\">" + sound[11] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[12] + "</strong></p><small class=\"IPA\">" + sound[12] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[11] + "</strong></p><small class=\"IPA\">" + sound[11] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수</strong><sub>(~들이, ~들의)</sub></td>";
		source_gram += "<td colspan=\"3\"><p><strong>" + gram[12] + "</strong></p><small class=\"IPA\">" + sound[12] + "</small></p></td></tr></table><hr>";

		}

		if (gram[13] != "-") {

		source_gram += "<p><strong>비교급 약변화</strong></p>";

		source_gram += "<table><tr><td>&nbsp;</td><td><strong>남성</strong></td><td><strong>여성</strong></td><td><strong>중성</strong></td></tr>";

		source_gram += "<tr><td><strong>단수 주격</strong><sub>(~이/가)</sub></td>";
		source_gram += "<td><p><strong>" + gram[13] + "</strong></p><small class=\"IPA\">" + sound[13] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[13] + "</strong></p><small class=\"IPA\">" + sound[13] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[14] + "</strong></p><small class=\"IPA\">" + sound[14] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>단수 속격</strong><sub>(~의)</sub></td>";
		source_gram += "<td><p><strong>" + gram[14] + "</strong></p><small class=\"IPA\">" + sound[14] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[13] + "</strong></p><small class=\"IPA\">" + sound[13] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[14] + "</strong></p><small class=\"IPA\">" + sound[14] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수</strong><sub>(~들이, ~들의)</sub></td>";
		source_gram += "<td colspan=\"3\"><p><strong>" + gram[13] + "</strong></p><small class=\"IPA\">" + sound[13] + "</small></p></td></tr></table><hr>";

		}

		if (gram[15] != "-") {

		source_gram += "<p><strong>최상급 약변화</strong></p>";

		source_gram += "<table><tr><td>&nbsp;</td><td><strong>남성</strong></td><td><strong>여성</strong></td><td><strong>중성</strong></td></tr>";

		source_gram += "<tr><td><strong>단수 주격</strong><sub>(~이/가)</sub></td>";
		source_gram += "<td><p><strong>" + gram[15] + "</strong></p><small class=\"IPA\">" + sound[15] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[16] + "</strong></p><small class=\"IPA\">" + sound[16] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[16] + "</strong></p><small class=\"IPA\">" + sound[16] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>단수 속격</strong><sub>(~의)</sub></td>";
		source_gram += "<td><p><strong>" + gram[16] + "</strong></p><small class=\"IPA\">" + sound[16] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[17] + "</strong></p><small class=\"IPA\">" + sound[17] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[16] + "</strong></p><small class=\"IPA\">" + sound[16] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수</strong><sub>(~들이, ~들의)</sub></td>";
		source_gram += "<td colspan=\"3\"><p><strong>" + gram[17] + "</strong></p><small class=\"IPA\">" + sound[17] + "</small></p></td></tr></table>";

		}

		source_gram += "</details>";
	}
	else if (word_class == "v") {
		source_gram = "<details><summary style=\"font-size: 18px;\">문법 정보 보기</summary>";

		source_gram += "<p>부정형: <strong>" + gram[0] + "</strong>&nbsp;<small class=\"IPA\">" + sound[0] + "</small></p>";

		source_gram += "<p><strong>현재분사</strong>&nbsp;(~하는)</p>";

		source_gram += "<table><tr><td>&nbsp;</td><td><strong>남성</strong></td><td><strong>여성</strong></td><td><strong>중성</strong></td></tr>";

		source_gram += "<tr><td><strong>단수 주격</strong><sub>(~이/가)</sub></td>";
		source_gram += "<td><p><strong>" + gram[1] + "</strong></p><small class=\"IPA\">" + sound[1] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[1] + "</strong></p><small class=\"IPA\">" + sound[1] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[2] + "</strong></p><small class=\"IPA\">" + sound[2] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>단수 속격</strong><sub>(~의)</sub></td>";
		source_gram += "<td><p><strong>" + gram[2] + "</strong></p><small class=\"IPA\">" + sound[2] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[1] + "</strong></p><small class=\"IPA\">" + sound[1] + "</small></p></td>";
		source_gram += "<td><p><strong>" + gram[2] + "</strong></p><small class=\"IPA\">" + sound[2] + "</small></p></td></tr>";

		source_gram += "<tr><td><strong>복수</strong><sub>(~들이, ~들의)</sub></td>";
		source_gram += "<td colspan=\"3\"><p><strong>" + gram[1] + "</strong></p><small class=\"IPA\">" + sound[1] + "</small></p></td></tr></table>";

		source_gram += "</details>";
	}
	

	source_gram = source_gram.replaceAll("[]", "&nbsp;");
	source_gram = source_gram.replaceAll("[-]", "&nbsp;");

	document.getElementById("gram").innerHTML = source_gram;

///////////////////////////////////
//korean gloss
	let e1 = document.getElementsByClassName("ADFB_gloss_ko")[0];
	let gloss_ko = grid(dict, column.gloss_ko, index).split("<br>");
	let source_e1 = "";
	for (var i = 0; i < gloss_ko.length; i ++) {
		source_e1 += "<strong>" + (i + 1).toString() + "</strong>. " + gloss_ko[i] + "<br>";
	}
	e1.innerHTML = source_e1;

///////////////////////////////////
//english gloss
	let e2 = document.getElementsByClassName("ADFB_gloss_en")[0];
	let gloss_en = grid(dict, column.gloss_en, index).split("<br>");
	let source_e2 = "";
	for (var i = 0; i < gloss_en.length; i ++) {
		source_e2 += "<strong>" + (i + 1).toString() + "</strong>. " + gloss_en[i] + "<br>";
	}
	e2.innerHTML = source_e2;

///////////////////////////////////
//encyclopaedia
	let e3 = document.getElementsByClassName("ADFB_gloss_ep_isExist")[0];
	if (grid(dict, column.encyclopaedia, index).length > 1) {
		e3.innerHTML = "«해설»";
		document.getElementById("ADFB_gloss_ep_isExist_hr").style.display = "block";
	}
	else {
		e3.innerHTML = "";
		document.getElementById("ADFB_gloss_ep_isExist_hr").style.display = "none";
	}

	let e4 = document.getElementsByClassName("ADFB_gloss_ep")[0];
	e4.innerHTML = grid(dict, column.encyclopaedia, index);

///////////////////////////////////
//examples
	let e5 = document.getElementsByClassName("ADFB_gloss_ex_isExist")[0];
	if (grid(dict, column.example, index).length > 1) {
		e5.innerHTML = "«예문»";
		document.getElementById("ADFB_gloss_ex_isExist_hr").style.display = "block";
	}
	else {
		e5.innerHTML = "";
		document.getElementById("ADFB_gloss_ex_isExist_hr").style.display = "none";
	}

	let e6 = document.getElementsByClassName("ADFB_gloss_ex")[0];
	e6.innerHTML = grid(dict, column.example, index);

///////////////////////////////////
//set ABC;
	let source_abc = "<br><hr>"
	let number_abc = 4; //how many words?

	for (var i = -number_abc; i <= number_abc; i ++) {
		let link = grid(dict, column.key, index + i);

		let t0 = grid(dict, column.title, index + i);
		let t1 = grid(dict, column.tag_synonym, index + i);

		let text = t0 + "<sup>" + t1 + "</sup>";

		//too forth or back; no word to show
		if (t0 == "") { continue; }

		if (i != 0) {
			source_abc += "<a onclick=\"link('" + link + "')\">" + text + "</a>";
		}
		else {
			source_abc += "<strong><a onclick=\"link('" + link + "')\">" + text + "</a></strong>";
		}
		
		source_abc += " · ";
	}

	if (source_abc.endsWith(" · ")) {
		source_abc = source_abc.slice(0, -3);
	}

	document.getElementById("abc").innerHTML = source_abc;
}

//reverse search
function load_query_ko(text) {
	text = text.trim().replaceAll(" ", "");

	let List = [];

	for (var i = 0; i < dict.length; i ++) {
		let line = db_text[i];

		if (line.includes(text)) {
			let gloss = grid(dict, column.gloss_ko, i).replaceAll("<br>", "; ");
			List.push([i, gloss]);
		}
	}

	show_page(["search_form"], ["suggestions", "mainpage", "ADFB", "abc"]);

	if (List.length == 0) {
		show_page(["not_found"], ["includes"]);
		return 0;
	}
	else {
		show_page(["includes"], ["not_found"]);
	}

	let source = "";

	for (var i = 0; i < List.length; i ++) {
		source += "<p><strong><a onclick=\"link('" + grid(dict, column.key, List[i][0]) + "')\">" + grid(dict, column.title, List[i][0]) + "</a></strong>:&nbsp;&nbsp;" + List[i][1] + "</p>";
	}

	document.getElementById("includes_search").innerHTML = source;
}

//부분일치
function load_query_include(text) {
	let List = [];

	let length_max = 10;
	
	switch (text.length) {
		case 1: length_max = 3; break;
		case 2: length_max = 5; break;
		case 3: length_max = 8; break;
	}

	for (var i = 0; i < dict.length; i ++) {
		if (grid(dict, column.title, i).toLowerCase().includes(text.toLowerCase()) && grid(dict, column.key, i) != Page && grid(dict, column.title, i).length <= text.length + length_max) {
			List.push(i);
		}
	}

	if (List.length == 0) {
		show_page([], ["includes"]);
		return 0;
	}
	else {
		show_page(["includes"], []);
	}

	let source = "";

	for (var i = 0; i < List.length; i ++) {
		let link = grid(dict, column.key, List[i]);
		let t0 = grid(dict, column.title, List[i]);
		let t1 = grid(dict, column.tag_synonym, List[i]);

		let t = t0 + "<sup>" + t1 + "</sup>";

		//동음이의어
		let t2 = Page.split("_")[0];

		if (t0 == t2) {
			source += "<strong><a onclick=\"link('" + link + "')\">" + t + "</a></strong>";
		}
		else {
			source += "<a onclick=\"link('" + link + "')\">" + t + "</a>";
		}

		if (i < List.length - 1) {
			source += " · ";
		}
	}

	document.getElementById("includes_search").innerHTML = source;
}

//유사 검색어
function load_query_suggest(text) {
	let List = [];

	for (var i = 0; i < dict.length; i ++) {
		if (Page == grid(dict, column.key, i).toLowerCase()) {
			List.push(0); continue;
		}

		let word1 = remove_diacritics(grid(dict, column.title, i).toLowerCase());
		let word2 = remove_diacritics(text.toLowerCase());

		let word_long = ""; let word_short = "";
		if (word1.length >= word2.length) { word_long = word1; word_short = word2; }
		else { word_long = word2; word_short = word1; }
		let len = word_long.length

		//일일이 비교
		let l1 = 0;

		for (var j = 0; j < len; j ++) {
			let chr1 = word_long.charAt(j);
			let chr2 = word_short.charAt(j);

			if (chr1 == "" || chr2 == "") { continue; }
			if (chr1 == chr2) { l1 ++; }
			if ((chr1 == "'" && chr2 == "’") || (chr2 == "'" && chr1 == "’")) { l1 ++; }
		}

		l1 /= len;

		//포함 관계
		let l2 = 0;

		if (word_long.includes(word_short)) {
			l2 = word_short.length / word_long.length;
		}

		let likeliness = Math.max(l1, l2);

		List.push(likeliness);
	}

	//유사도 상위 n개 추출, 유사도 1(=같음)은 제외
	let Index = [-1]; let IndexMax = 1; let howmany = 15;

	while (Index.length <= howmany) {
		let ind = 0; let max = 0;

		for (var i = 0; i < List.length; i ++) {
			if (List[i] > max && List[i] <= IndexMax && !Index.includes(i)) {
				ind = i; max = List[i];
			}
		}

		if (max == 0) { break; }

		Index.push(ind);
		IndexMax = max;
	}

	let IndexRemoveDuplicate = Array.from(new Set(Index));

	let source = "";
	
	for (var i = 0; i < IndexRemoveDuplicate.length; i ++) {
		if (IndexRemoveDuplicate[i] == -1) { continue; }

		let link = grid(dict, column.key, IndexRemoveDuplicate[i]);
		let t0 = grid(dict, column.title, IndexRemoveDuplicate[i]);
		let t1 = grid(dict, column.tag_synonym, IndexRemoveDuplicate[i]);

		let t = t0 + "<sup>" + t1 + "</sup>";

		//동음이의어
		let t2 = Page.split("_")[0];

		if (t0 == t2) {
			source += "<strong><a onclick=\"link('" + link + "')\">" + t + "</a></strong>";
		}
		else {
			source += "<a onclick=\"link('" + link + "')\">" + t + "</a>";
		}


		if (i < IndexRemoveDuplicate.length - 1) {
			source += " · "
		}
	}

	document.getElementById("suggestions_search").innerHTML = source;
}

//특수 검색어
function load_query_command(text, call) {
	switch (text) {
		case "#main": load_main(call); return true; break;
		case "#A": load_abc("A", call); return true; break;
		case "#Á": load_abc("Á", call); return true; break;
		case "#B": load_abc("B", call); return true; break;
		case "#D": load_abc("D", call); return true; break;
		case "#E": load_abc("E", call); return true; break;
		case "#F": load_abc("F", call); return true; break;
		case "#G": load_abc("G", call); return true; break;
		case "#H": load_abc("H", call); return true; break;
		case "#I": load_abc("I", call); return true; break;
		case "#Í": load_abc("Í", call); return true; break;
		case "#J": load_abc("J", call); return true; break;
		case "#K": load_abc("K", call); return true; break;
		case "#L": load_abc("L", call); return true; break;
		case "#M": load_abc("M", call); return true; break;
		case "#N": load_abc("N", call); return true; break;
		case "#O": load_abc("O", call); return true; break;
		case "#Ó": load_abc("Ó", call); return true; break;
		case "#Ö": load_abc("Ö", call); return true; break;
		case "#P": load_abc("P", call); return true; break;
		case "#R": load_abc("R", call); return true; break;
		case "#S": load_abc("S", call); return true; break;
		case "#T": load_abc("T", call); return true; break;
		case "#U": load_abc("U", call); return true; break;
		case "#Ú": load_abc("Ú", call); return true; break;
		case "#V": load_abc("V", call); return true; break;
		case "#Y": load_abc("Y", call); return true; break;
		case "#Ý": load_abc("Ý", call); return true; break;
		case "#Þ": load_abc("Þ", call); return true; break;
		case "#Æ": load_abc("Æ", call); return true; break;
	}

	if (text.includes("#appendix")) {
		load_appendix(text, call); return true;
	}

	return false;
}
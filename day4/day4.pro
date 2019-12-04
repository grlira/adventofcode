check_repeat_chars([]) :- false.
check_repeat_chars([_|[]]):- false.
check_repeat_chars([C1,C2|T]) :-
    C1 == C2,!;
    (
    	append([C2], T, Rest),
		check_repeat_chars(Rest)
    ).

check_repeat(Number) :-
    number_chars(Number, Chars),
    check_repeat_chars(Chars).

check_increase([]) :- true.
check_increase([_|[]]) :- true.
check_increase([H1,H2|T]) :-
    number_string(N1, [H1]),
    number_string(N2, [H2]),
    N1 =< N2,
    append([H2], T, Rest),
    check_increase(Rest).

only_increase(Number) :-
    number_chars(Number, Chars),
    check_increase(Chars).
    
result(I1, I2) :-
    numlist(I1, I2, List),
    include(check_repeat, List, List2),
    include(only_increase, List2, List3),
    length(List3, Length),
    print(Length).
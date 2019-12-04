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

has_pair_chars(_,[]) :- false.
has_pair_chars(_,[_|[]]) :- false.
has_pair_chars(C0,[C1,C2|[]]) :- C0 \== C1, C1 == C2.
         
has_pair_chars(C0,[C1, C2, C3|T]) :-
    (C0 \== C1, C1 == C2, C2 \== C3);
    (   
    	append([C2, C3], T, Rest),
    	has_pair_chars(C1,Rest)
    ).
has_pair_chars(L) :- has_pair_chars('', L).
    
has_pair(Number) :-
    number_chars(Number, Chars),
    has_pair_chars(Chars).

result(I1, I2) :-
    numlist(I1, I2, List),
    include(has_pair, List, List2),
    include(only_increase, List2, List3),
    length(List3, Length),
    print(Length).
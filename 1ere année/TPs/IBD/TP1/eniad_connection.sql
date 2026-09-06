-- 1) select distinct codform , descform ,prix , nom , prenom from formation natural join participant order by codform,nom

-- 2) select p.codpart, p.nom , p.prenom ,i.codform, i.avance , f.descform from inscription i join participant p on i.codpart = p.codpart join formation f on i.codform = f.codform order by f.codform 

-- 3) SELECT f.CodForm, f.Prix, COUNT(*) AS NombreParticipants, SUM(i.Avance) AS MontantTotalRealise FROM Inscription i JOIN Formation f ON f.CodForm = i.CodForm GROUP BY f.CodForm, f.Prix ORDER BY f.CodForm;

-- 4) SELECT * FROM Formation where datdebut < SYSDATE

-- 5) select * from formation where datdebut < sysdate and datfin > sysdate

-- 6) select codpart , count(codform) as "Nombre de formation"  from inscription GROUP BY codpart 

-- 7) SELECT i.CodPart, p.Nom, COUNT(i.CodForm) AS Nombre_de_formation FROM Inscription i JOIN Participant p ON i.CodPart = p.CodPart GROUP BY i.CodPart, p.Nom HAVING COUNT(i.CodForm) >= 2;

-- 8) SELECT p.Nom, p.Prenom, COUNT(i.CodForm) AS "Nombre_de_formations" FROM Participant p LEFT JOIN Inscription i ON p.CodPart = i.CodPart GROUP BY p.CodPart, p.Nom, p.Prenom ORDER BY p.Nom, p.Prenom;

-- 9) SELECT f.DescForm AS "Nom_de_la_formation", COUNT(i.CodPart) AS "Nombre_de_participants" FROM Formation f LEFT JOIN Inscription i ON f.CodForm = i.CodForm GROUP BY f.CodForm, f.DescForm ORDER BY f.DescForm;
